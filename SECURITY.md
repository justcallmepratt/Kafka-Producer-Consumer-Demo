# Security Policy

## Supported versions

Only the latest commit on `main` is supported. Fixes are made there; there are no
maintained release branches.

## Reporting a vulnerability

Please do not open a public issue. Report it privately with GitHub's
[private vulnerability reporting](https://github.com/justcallmepratt/Kafka-Producer-Consumer-Demo/security/advisories/new)
on this repository (Security tab → Report a vulnerability).

Include what you found, how to reproduce it, and the affected path or endpoint. You
will get a reply on the advisory thread; this is a personal project, so please allow
some days.

## How this service is meant to be exposed

The REST API has no user accounts. It is safe on a public URL only under these rules,
which the live deployment follows:

- **The browser never calls this API directly.** A trusted server (the personal site's
  `/api/kafka/*` routes) relays requests. Validation, size limits, rate limiting and
  per-visitor scoping live in that relay.
- **`DEMO_API_TOKEN` is set.** Every `/api/**` request must then carry the same value
  in the `X-Demo-Token` header or it is rejected with 401. Without the token anyone
  who finds the URL can produce records or call `DELETE /api/kafka/consume`.
- **The broker has no public address.** It is reachable only on the platform's private
  network, so it runs without authentication.
- **The database table is not in an API-exposed schema.** On Supabase it lives in its
  own schema, not `public`.

The bundled static UI calls the API from the browser and cannot send the token. It is
for local development, where the token is unset.

## Secrets

- All configuration comes from environment variables. No credential belongs in the
  repository, in `application*.properties` defaults, or in the Docker image.
- `.env*` files are gitignored; `.env.example` holds placeholders only.
- Set secrets (`DEMO_API_TOKEN`, `SPRING_DATASOURCE_PASSWORD`) in the host's variable
  store. Generate the token with `openssl rand -hex 32` and store the same value on
  the relay. To rotate it, set the new value in both places and redeploy both.
- The token is compared in constant time and is never logged or echoed in responses.

## Automated checks

CodeQL scans Java and the static JavaScript on every pull request and weekly.
Dependabot opens weekly update PRs for Maven dependencies, GitHub Actions and the
Docker base images.
