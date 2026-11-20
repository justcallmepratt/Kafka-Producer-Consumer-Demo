# Deployment

How the service runs in production. Step-by-step setup, including every broker and app
variable, is in the main [README](../README.md#-deploying-to-railway).

## Architecture

```
  browser ──▶ justcallmepratt.dev (Vercel)
              /projects/kafka page, /api/kafka/* relay
                        │ server-side only, X-Demo-Token
                        ▼
              kafka-demo-api (Railway, public URL)
              Spring Boot: producer + consumer + REST API
                 │ private network            │ TLS
                 ▼                            ▼
              kafka (Railway)             Supabase Postgres
              single-node KRaft broker    schema kafka_demo
```

- **One Railway project, two services.** `kafka-demo-api` is built from this repo's
  Dockerfile ([`railway.toml`](../railway.toml)). `kafka` is the `apache/kafka` image
  with a volume and no public domain.
- **The browser only talks to the site.** The site's relay holds the API token; see
  [SECURITY.md](../SECURITY.md).
- **Records are stored in Postgres**, in table `kafka_demo.kafka_demo_messages`. The
  table is created by hand (SQL in the README) and the app runs with
  `JPA_DDL_AUTO=validate`, so it never changes the schema itself.

## Releasing

Merging to `main` is the release. CI builds and tests every pull request. Railway
redeploys the service from `main` once it is connected to the repository (service →
Settings → Source); a deployment that fails its `/actuator/health` check does not
replace the running one.

## Edge cases and what happens

| Situation | Behaviour |
|---|---|
| `DEMO_API_TOKEN` not set | The API is open. Fine locally; never on a public URL |
| Request without the token, or with the wrong one | 401 with a JSON error; actuator and static files are not gated |
| Token differs between the service and the relay | Every relay call gets 401; the site shows "service is not responding" |
| Broker down or restarting | The consumer keeps retrying on its own. Produce calls wait on the broker and the site's relay gives up after 10 s |
| Broker volume lost | Topics and offsets are recreated empty on next start. Records already stored in Postgres are unaffected |
| Database unreachable (or Supabase project paused) | Health goes DOWN and reads fail. A record consumed during the outage is retried a few times by Spring Kafka's default error handler, then skipped, so it never reaches the store |
| Table missing or its columns do not match | The app fails to start (`validate`), the health check fails, and Railway keeps the previous deployment |
| Database pool exhausted | Requests queue for a connection; the pool is capped by `DB_POOL_SIZE` (2) to stay inside the Supabase pooler's limits |
| More than 100 records stored | `GET /api/kafka/messages` returns the newest 100; older rows stay in the table |
| `DELETE /api/kafka/consume` | Deletes every stored record for all sessions. The site's relay does not expose it |

## Costs

Both Railway services run continuously (a Kafka consumer holds a connection open, so
neither can sleep). The broker's heap is capped at 256 MB and the app's at 256 MB to
keep memory billing low. Supabase is on the free plan, which pauses a project after
about a week without database activity.
