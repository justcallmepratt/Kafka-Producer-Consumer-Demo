# 12-Factor App Compliance Report

> **Note:** written when the app stored messages in MongoDB. It now uses PostgreSQL through Spring Data JPA (`SPRING_DATASOURCE_*` instead of `MONGODB_URI`); see the main README.

## ✅ How This Application Implements 12-Factor Principles

### 1. Codebase ✅
**One codebase tracked in revision control, many deploys**

- Single Git repository
- Same codebase deployed to dev, staging, and production
- Environment-specific configuration handled via environment variables

**Implementation:**
```bash
git init
# Single repo for all environments
```

---

### 2. Dependencies ✅
**Explicitly declare and isolate dependencies**

- All dependencies declared in `pom.xml`
- Maven handles dependency resolution
- No system-wide dependencies assumed
- Containerized with Docker for complete isolation

**Implementation:**
```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.kafka</groupId>
        <artifactId>spring-kafka</artifactId>
    </dependency>
    <!-- All dependencies explicitly declared -->
</dependencies>
```

---

### 3. Config ✅
**Store config in the environment**

- **NO hardcoded credentials** in source code
- All configuration via environment variables
- Defaults provided for development
- Production values set via deployment platform

**Implementation:**
```properties
# application.properties
MONGODB_URI=${MONGODB_URI:mongodb://localhost:27017}
KAFKA_BOOTSTRAP_SERVERS=${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
```

**Environment files:**
- `.env.example` - Template (committed)
- `.env.dev` - Development (ignored)
- `.env.prod` - Production (ignored)

---

### 4. Backing Services ✅
**Treat backing services as attached resources**

- MongoDB: Configured via `MONGODB_URI` environment variable
- Kafka: Configured via `KAFKA_BOOTSTRAP_SERVERS` environment variable
- Can swap between local, cloud, or managed services without code changes
- Connection strings are URLs

**Implementation:**
```java
// Services configured via Spring Boot autoconfiguration
// No hardcoded connections
@Value("${spring.data.mongodb.uri}")
private String mongoUri;
```

---

### 5. Build, Release, Run ✅
**Strictly separate build and run stages**

**Build Stage:**
```bash
./mvnw clean package
# Produces: target/demo-0.0.1-SNAPSHOT.jar
```

**Release Stage:**
```bash
# Combine build with config
docker build -t kafka-demo:v1.0.0 .
```

**Run Stage:**
```bash
java -jar app.jar
# Or: docker run kafka-demo:v1.0.0
```

**Dockerfile implements proper separation:**
```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
...
# Run stage
FROM eclipse-temurin:21-jre-alpine
...
```

---

### 6. Processes ✅
**Execute the app as one or more stateless processes**

- Application is stateless
- No in-memory session storage
- All data persisted to MongoDB (external store)
- Can scale horizontally by adding more instances
- No sticky sessions required

**Implementation:**
```java
// Consumer saves to MongoDB (external state)
@KafkaListener(topics = "${kafka.topic.name}")
public void consume(String message) {
    messageRepository.save(new Message(message)); // External storage
}
```

---

### 7. Port Binding ✅
**Export services via port binding**

- Embedded Tomcat server
- Self-contained HTTP service
- No external web server required
- Port configurable via `PORT` environment variable

**Implementation:**
```properties
server.port=${PORT:8080}
```

```bash
# Can run standalone
java -jar demo.jar
# Listens on configured port
```

---

### 8. Concurrency ✅
**Scale out via the process model**

- Stateless design allows horizontal scaling
- Multiple instances can run simultaneously
- Kafka consumer groups distribute messages
- No shared state between processes

**Scaling:**
```bash
# Local: Run multiple instances
PORT=8080 java -jar app.jar &
PORT=8081 java -jar app.jar &

# Kubernetes: Scale replicas
kubectl scale deployment kafka-demo --replicas=3
```

---

### 9. Disposability ✅
**Maximize robustness with fast startup and graceful shutdown**

- Fast startup (Spring Boot optimized)
- Graceful shutdown enabled
- Kafka consumer commits offsets on shutdown
- No long-running startup tasks

**Implementation:**
```properties
# Graceful shutdown
spring.lifecycle.timeout-per-shutdown-phase=30s

# Kafka graceful handling
spring.kafka.consumer.enable-auto-commit=true
```

---

### 10. Dev/Prod Parity ✅
**Keep development, staging, and production as similar as possible**

- Same backing services (Kafka, MongoDB)
- Docker Compose for local development mirrors production
- Environment-specific configs, not code changes
- Same deployment artifacts

**Implementation:**
```bash
# Development
docker-compose up  # Same services as production

# Production
# Same Kafka, same MongoDB, same container image
```

**Profiles:**
- `application-dev.properties` - Development settings
- `application-prod.properties` - Production settings
- Same codebase, different config

---

### 11. Logs ✅
**Treat logs as event streams**

- All logs written to `stdout`
- No log file management in application
- Container platform captures logs
- Structured logging pattern

**Implementation:**
```properties
# Logs to stdout
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# No file appenders
# Container runtime captures stdout
```

**Usage:**
```bash
# Docker captures logs
docker logs kafka-demo

# Kubernetes captures logs
kubectl logs kafka-demo-pod

# Cloud platforms capture automatically
```

---

### 12. Admin Processes ✅
**Run admin/management tasks as one-off processes**

- Spring Actuator for health checks
- Management endpoints for metrics
- Same environment as main app
- Can run database migrations separately

**Implementation:**
```properties
# Admin endpoints
management.endpoints.web.exposure.include=health,info,metrics
```

**Endpoints:**
- `/actuator/health` - Health checks
- `/actuator/metrics` - Application metrics
- `/actuator/info` - Application info

**One-off tasks:**
```bash
# Database migration (if needed)
java -jar app.jar --spring.profiles.active=migrate

# Health check
curl http://localhost:8080/actuator/health
```

---

## 🔒 Security Best Practices

1. ✅ Secrets in environment variables, never in code
2. ✅ `.env` files in `.gitignore`
3. ✅ `.env.example` provides template without secrets
4. ✅ Different credentials per environment
5. ✅ CORS configured for specific origins
6. ✅ Non-root user in Docker container
7. ✅ Health checks don't expose sensitive data

---

## 🚀 Deployment Checklist

- [ ] Set all environment variables on deployment platform
- [ ] Verify backing services are accessible
- [ ] Configure health check endpoint
- [ ] Set up log aggregation
- [ ] Configure auto-scaling rules
- [ ] Set resource limits
- [ ] Enable monitoring/alerting
- [ ] Test rollback procedure
- [ ] Document runbook

---

## 📊 Platform Compatibility

This 12-factor compliant app can run on:

- ✅ **Heroku** - Native 12-factor platform
- ✅ **Cloud Foundry** - 12-factor focused
- ✅ **AWS Elastic Beanstalk** - Environment variables via console
- ✅ **Google Cloud Run** - Container-based, env vars
- ✅ **Azure App Service** - Application settings
- ✅ **Kubernetes** - ConfigMaps and Secrets
- ✅ **Docker** - Environment files
- ✅ **Any cloud platform** supporting containers

---

## 🎯 Benefits Achieved

1. **Portability**: Runs anywhere containers are supported
2. **Scalability**: Horizontal scaling with no code changes
3. **Maintainability**: Clear separation of code and config
4. **Security**: No secrets in codebase
5. **Reliability**: Stateless, disposable processes
6. **Observability**: Logs as streams, health checks
7. **Developer Experience**: Local dev matches production

---

## 📋 Verification Commands

```bash
# 1. Verify dependencies are explicit
./mvnw dependency:tree

# 2. Check for hardcoded config
grep -r "mongodb://" src/  # Should only be in .env files

# 3. Test environment variable usage
unset MONGODB_URI
./mvnw spring-boot:run  # Should fail or use default

# 4. Verify stateless
# Run two instances, both should work independently

# 5. Check logs go to stdout
./mvnw spring-boot:run 2>&1 | grep "Started DemoApplication"

# 6. Verify health endpoint
curl http://localhost:8080/actuator/health

# 7. Test graceful shutdown
# Send SIGTERM, check Kafka consumer commits
```

---

**This application is fully 12-Factor compliant and ready for cloud-native deployment! ☁️**
