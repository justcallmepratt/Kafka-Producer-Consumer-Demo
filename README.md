# Kafka Producer & Consumer Demo

A **12-Factor compliant**, **modular** Spring Boot application demonstrating Kafka producer and consumer functionality with PostgreSQL persistence and a modern micro frontend UI.

**Live demo:** [justcallmepratt.dev/projects/kafka](https://justcallmepratt.dev/projects/kafka) — send a record and watch it go through a real broker. How that deployment is put together: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

[![CI](https://github.com/justcallmepratt/Kafka-Producer-Consumer-Demo/actions/workflows/ci.yml/badge.svg)](https://github.com/justcallmepratt/Kafka-Producer-Consumer-Demo/actions/workflows/ci.yml)
[![CodeQL](https://github.com/justcallmepratt/Kafka-Producer-Consumer-Demo/actions/workflows/codeql.yml/badge.svg)](https://github.com/justcallmepratt/Kafka-Producer-Consumer-Demo/actions/workflows/codeql.yml)

## 🏗️ Architecture

This application uses a **Maven multi-module architecture** for clean separation of concerns:

```
demo-parent/
├── demo-common/          # Domain models and repositories
├── demo-kafka/           # Kafka configuration and services  
├── demo-api/             # REST controllers and web config
└── demo-app/             # Main executable application
```

📖 **See [MODULAR-ARCHITECTURE.md](MODULAR-ARCHITECTURE.md) for detailed module documentation**

## 🎯 12-Factor App Principles

This application follows the [12-Factor App](https://12factor.net/) methodology:

1. **Codebase** - Single codebase tracked in Git
2. **Dependencies** - Explicitly declared in `pom.xml`
3. **Config** - All configuration via environment variables (no secrets in code)
4. **Backing Services** - Kafka & PostgreSQL treated as attached resources
5. **Build, Release, Run** - Separate stages with Docker support
6. **Processes** - Stateless, share-nothing architecture
7. **Port Binding** - Self-contained HTTP service via embedded Tomcat
8. **Concurrency** - Scale out via multiple process instances
9. **Disposability** - Fast startup and graceful shutdown
10. **Dev/Prod Parity** - Same backing services and config pattern
11. **Logs** - Streams to stdout (captured by container orchestration)
12. **Admin Processes** - Use actuator endpoints for health checks

## 🎯 Features

### Backend (Spring Boot)
- ✅ Kafka producer/consumer with Spring Kafka
- ✅ PostgreSQL persistence with Spring Data JPA
- ✅ RESTful API endpoints
- ✅ Health checks via Spring Actuator
- ✅ CORS support for Angular frontend
- ✅ Environment-based configuration
- ✅ Docker & Docker Compose ready

### Current Frontend (HTML)
- Modern responsive UI
- Real-time message display
- Auto-refresh functionality

### Ready for Angular Migration
- ✅ CORS configured for `http://localhost:4200`
- ✅ RESTful API with proper HTTP methods
- ✅ JSON request/response format
- ✅ Separation of concerns (backend API ready)

## 📋 Prerequisites

- Java 21
- Docker & Docker Compose (for Kafka)
- PostgreSQL (the bundled Docker Compose file starts one)
- Maven (included via wrapper)
- *Optional:* Angular CLI for frontend migration

## 🚀 Quick Start

### 1. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.dev
```

Edit `.env.dev` with your actual credentials:
```bash
# PostgreSQL (these are the defaults for the Docker Compose database)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# Kafka (local or cloud)
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### 2. Start Kafka

Using Docker Compose:
```bash
docker compose up -d
```

### 3. Build Multi-Module Project

**Build all modules:**
```bash
./mvnw clean install
```

**Or skip tests:**
```bash
./mvnw clean install -DskipTests
```

This will build all 4 modules in order:
1. demo-common (models & repositories)
2. demo-kafka (Kafka services)
3. demo-api (REST controllers)
4. demo-app (main application)

### 4. Run the Application

**Option A: Using Maven (Development)**
```bash
cd demo-app
../mvnw spring-boot:run
```

**Option B: Using JAR (Production)**
```bash
# Load environment variables
export $(cat .env.dev | grep -v '^#' | xargs)

# Run executable JAR
java -jar demo-app/target/demo-app-0.0.1-SNAPSHOT.jar
```

**Option C: All-in-One Commands**
```bash
# Quick start (assuming Kafka is running)
export $(cat .env.dev | grep -v '^#' | xargs) && \
./mvnw clean install -DskipTests && \
java -jar demo-app/target/demo-app-0.0.1-SNAPSHOT.jar
```

### 5. Access the Application

- **Web UI:** http://localhost:8080
- **API Base:** http://localhost:8080/api/kafka
- **Health Check:** http://localhost:8080/actuator/health
- **API Docs:** http://localhost:8080/actuator

## 📡 API Endpoints

### Kafka Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kafka/produce` | Send message to Kafka |
| GET | `/api/kafka/consume` | Get consumed messages (strings) |
| GET | `/api/kafka/messages` | Get messages with metadata |
| DELETE | `/api/kafka/consume` | Clear all messages |

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Application health status |
| GET | `/actuator/info` | Application information |
| GET | `/actuator/metrics` | Application metrics |

### Example API Usage

**Send a message:**
```bash
curl -X POST http://localhost:8080/api/kafka/produce \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Kafka!", "key": "test-key"}'
```

**Get messages:**
```bash
curl http://localhost:8080/api/kafka/messages
```

## 🎨 Migrating to Angular Frontend

The backend is already configured for Angular integration. Here's how to create the Angular frontend:

### Step 1: Create Angular Project

```bash
ng new kafka-demo-ui
cd kafka-demo-ui
```

### Step 2: Configure Angular Environment

Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/kafka'
};
```

### Step 3: Create Service

```bash
ng generate service services/kafka
```

`kafka.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Message {
  id: string;
  content: string;
  key: string;
  timestamp: string;
  topic: string;
}

@Injectable({
  providedIn: 'root'
})
export class KafkaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(message: string, key?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/produce`, { message, key });
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages`);
  }

  clearMessages(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/consume`);
  }
}
```

### Step 4: Run Angular App

```bash
ng serve
```

Angular will run on `http://localhost:4200` with full API access (CORS already configured).

### Benefits of Angular Frontend

- ✅ TypeScript type safety
- ✅ Component-based architecture
- ✅ RxJS for reactive programming
- ✅ Better state management
- ✅ Built-in routing
- ✅ Production build optimization

## 🌍 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | demo | Application name |
| `PORT` | 8080 | Server port (12-Factor: Port binding) |
| `SPRING_DATASOURCE_URL` | jdbc:postgresql://localhost:5432/postgres | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | postgres | Database user |
| `SPRING_DATASOURCE_PASSWORD` | postgres | Database password |
| `DB_POOL_SIZE` | 2 | Maximum database connections |
| `DB_SCHEMA` | public | Schema that holds the table |
| `JPA_DDL_AUTO` | update | `update` creates the `kafka_demo_messages` table; use `validate` when you create it yourself |
| `DEMO_API_TOKEN` | - | Optional shared secret for `/api/**` (see Deploying to Railway) |
| `KAFKA_BOOTSTRAP_SERVERS` | localhost:9092 | Kafka broker addresses |
| `KAFKA_CONSUMER_GROUP_ID` | demo-group | Consumer group ID |
| `KAFKA_TOPIC_NAME` | demo-topic | Kafka topic name |
| `CORS_ALLOWED_ORIGINS` | localhost:4200,* | Allowed CORS origins |
| `LOG_LEVEL` | INFO | Application log level |
| `SPRING_PROFILES_ACTIVE` | - | Active Spring profile (dev/prod) |

## 🚂 Deploying to Railway

Three pieces: this app and a Kafka broker as two services in one Railway project, plus
a PostgreSQL database (a Supabase free project works).

### 1. Broker service

New service → Docker image `apache/kafka:3.9.1` (single node, KRaft, no ZooKeeper).
Name the service `kafka`: the name becomes its private hostname. Do **not** give it a
public domain; only the app talks to it, over Railway's private network.

Attach a volume mounted at `/var/lib/kafka/data` and set these variables:

| Variable | Value |
|---|---|
| `KAFKA_NODE_ID` | `1` |
| `KAFKA_PROCESS_ROLES` | `broker,controller` |
| `KAFKA_LISTENERS` | `PLAINTEXT://:9092,CONTROLLER://:9093` |
| `KAFKA_ADVERTISED_LISTENERS` | `PLAINTEXT://kafka.railway.internal:9092` |
| `KAFKA_LISTENER_SECURITY_PROTOCOL_MAP` | `PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT` |
| `KAFKA_CONTROLLER_LISTENER_NAMES` | `CONTROLLER` |
| `KAFKA_CONTROLLER_QUORUM_VOTERS` | `1@localhost:9093` |
| `KAFKA_INTER_BROKER_LISTENER_NAME` | `PLAINTEXT` |
| `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR` | `1` |
| `KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR` | `1` |
| `KAFKA_TRANSACTION_STATE_LOG_MIN_ISR` | `1` |
| `KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS` | `0` |
| `KAFKA_LOG_DIRS` | `/var/lib/kafka/data/logs` (a subfolder: the volume root holds `lost+found`, which Kafka rejects) |
| `KAFKA_LOG_RETENTION_HOURS` | `24` |
| `KAFKA_LOG_RETENTION_BYTES` | `104857600` |
| `KAFKA_HEAP_OPTS` | `-Xms256m -Xmx256m` |
| `CLUSTER_ID` | any fixed 22-character base64 id, e.g. from `kafka-storage.sh random-uuid` |
| `RAILWAY_RUN_UID` | `0` (Railway volumes are mounted as root; the image runs as a non-root user) |

### 2. App service

New service from this repository. [`railway.toml`](railway.toml) supplies the Dockerfile
build, the `/actuator/health` check and a capped JVM heap. Generate a public domain for
it and set:

| Variable | Value |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka.railway.internal:9092` |
| `KAFKA_TOPIC_NAME` | `demo-topic` |
| `KAFKA_CONSUMER_GROUP_ID` | `demo-group` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<host>:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | the database user |
| `SPRING_DATASOURCE_PASSWORD` | the database password |
| `DB_POOL_SIZE` | `2` |
| `JPA_DDL_AUTO` | `validate` (see the table below) |
| `DB_SCHEMA` | `kafka_demo` |
| `DEMO_API_TOKEN` | `openssl rand -hex 32` |
| `CORS_ALLOWED_ORIGINS` | the site that calls the API, if a browser calls it directly |

**Supabase:** use the **Session pooler** host and username from Connect (the direct
host is IPv6-only on the free plan). Supabase serves every table in the `public` schema
over its REST API, so keep this table out of it: create it yourself in a schema of its
own and point the app there with `DB_SCHEMA`.

```sql
create schema if not exists kafka_demo;
create table kafka_demo.kafka_demo_messages (
  id          varchar(36)  primary key,
  content     text         not null,
  message_key varchar(512),
  created_at  timestamp(6) not null,
  topic       varchar(255)
);
create index kafka_demo_messages_created_at_idx on kafka_demo.kafka_demo_messages (created_at);
alter table kafka_demo.kafka_demo_messages enable row level security;
```

### 3. The API token

With `DEMO_API_TOKEN` set, every `/api/**` request must send the same value in an
`X-Demo-Token` header or it gets a 401. That is what stops strangers from producing
records or calling `DELETE /api/kafka/consume` on a public URL. It is meant for a trusted
server calling the API; the bundled HTML UI cannot send the header, so it only works
where the token is unset (local development).

```bash
curl -H "X-Demo-Token: $DEMO_API_TOKEN" https://<app-domain>/api/kafka/messages
```

## 🏭 Production Deployment

### Cloud-Native Deployment (12-Factor)

**Deploy to Cloud Platform (Heroku, Cloud Foundry, etc.)**

```bash
# Set environment variables in your cloud platform
# Build the application
./mvnw clean package

# Deploy (platform specific)
# The app binds to $PORT automatically
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka-demo
spec:
  replicas: 3  # Scale horizontally
  template:
    spec:
      containers:
      - name: kafka-demo
        image: your-registry/kafka-demo:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: uri
        - name: KAFKA_BOOTSTRAP_SERVERS
          value: "kafka-service:9092"
```

## 📊 Monitoring & Observability

Access Spring Boot Actuator endpoints:

```bash
# Health check
curl http://localhost:8080/actuator/health

# Kafka health
curl http://localhost:8080/actuator/health/kafka

# Database health
curl http://localhost:8080/actuator/health/db

# Metrics
curl http://localhost:8080/actuator/metrics
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use secrets management** - Vault, AWS Secrets Manager, etc.
3. **Rotate credentials regularly** - database and Kafka passwords
4. **Use HTTPS in production** - Configure SSL/TLS
5. **Restrict CORS origins** - Set specific domains in production
6. **Enable authentication** - Add Spring Security if needed

## 🏗️ Project Structure

```
src/main/java/com/example/demo/
├── DemoApplication.java              # Main application class
├── config/
│   ├── KafkaTopicConfig.java        # Kafka topic auto-creation
│   └── CorsConfig.java              # CORS for Angular
├── controller/
│   └── KafkaController.java         # REST API endpoints
├── model/
│   └── Message.java                 # JPA entity      
├── repository/
│   └── MessageRepository.java       # JPA repository    
└── service/
    ├── KafkaProducerService.java    # Message producer
    └── KafkaConsumerService.java    # Message consumer

src/main/resources/
├── application.properties            # Base configuration
├── application-dev.properties        # Development overrides
└── application-prod.properties       # Production overrides
```

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run with coverage
./mvnw verify

# Test the API manually
curl -X POST http://localhost:8080/api/kafka/produce \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message"}'
```

## 🐛 Troubleshooting

**Kafka Connection Error:**
- Ensure Kafka is running: `docker-compose ps`
- Check logs: `docker-compose logs kafka`
- Verify `KAFKA_BOOTSTRAP_SERVERS` in `.env.dev`

**Database Connection Error:**
- Verify `SPRING_DATASOURCE_*` in `.env.dev`
- Check the database is running (`docker compose ps`)
- With `JPA_DDL_AUTO=validate`, make sure the `kafka_demo_messages` table exists

**CORS Issues with Angular:**
- Verify `CORS_ALLOWED_ORIGINS` includes `http://localhost:4200`
- Check browser console for specific CORS errors
- Ensure Angular runs on port 4200

**Environment Variables Not Loading:**
- On Mac/Linux: `export $(cat .env.dev | grep -v '^#' | xargs)`
- On Windows: Use `.env.dev` contents to set variables manually
- Or use Spring profile: `SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run`

## 📚 Documentation

Detailed documentation is available in the [`docs/`](docs/) directory:

- **[Documentation Index](docs/DOCUMENTATION-INDEX.md)** - Complete documentation navigator
- **[Module Architecture](docs/MODULAR-ARCHITECTURE.md)** - Multi-module structure guide
- **[12-Factor Compliance](docs/12-FACTOR-COMPLIANCE.md)** - Cloud-native best practices
- **[Micro Frontend](docs/MICRO-FRONTEND.md)** - Frontend architecture guide
- **[Angular Migration](docs/ANGULAR_MIGRATION.md)** - Angular setup and migration
- **[Refactoring Summary](docs/REFACTORING-SUMMARY.md)** - Detailed refactoring changelog
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production architecture and edge cases
- **[SECURITY.md](SECURITY.md)** - Exposure rules, secrets and vulnerability reporting

## 📚 Technologies Used

### Architecture
- **Maven Multi-Module** - Modular project structure (4 modules)
- **12-Factor App** - Cloud-native best practices
- **Micro Frontend** - Independent, composable UI modules

### Backend
- **Spring Boot 4.0.2** - Application framework
- **Spring Kafka** - Kafka integration
- **Spring Data JPA** - PostgreSQL persistence
- **Spring Actuator** - Health checks and monitoring
- **Apache Kafka** - Message streaming
- **PostgreSQL** - Database
- **Docker** - Containerization
- **Maven** - Build tool

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Useful Links

- [12-Factor App Methodology](https://12factor.net/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [PostgreSQL](https://www.postgresql.org/)
- [Angular Documentation](https://angular.io/docs)
- [Docker Documentation](https://docs.docker.com/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review application logs: `./mvnw spring-boot:run`

---

Built with ❤️ following 12-Factor App principles
