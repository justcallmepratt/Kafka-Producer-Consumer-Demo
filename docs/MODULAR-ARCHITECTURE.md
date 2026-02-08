# Multi-Module Maven Project Structure

This project has been refactored into a **Maven multi-module architecture** for better separation of concerns, maintainability, and scalability.

## 📦 Module Architecture

```
demo-parent/
├── demo-common/          # Domain models and repositories
├── demo-kafka/           # Kafka configuration and services  
├── demo-api/             # REST controllers and web config
└── demo-app/             # Main executable application
```

## Module Details

### 1. **demo-common** (Shared Foundation)
**Purpose**: Domain models and data access layer

**Contains**:
- `Message.java` - MongoDB document model
- `MessageRepository.java` - Spring Data MongoDB repository

**Dependencies**:
- `spring-boot-starter-data-mongodb`
- `spring-boot-starter`

**Package**: `com.example.demo.common.*`

---

### 2. **demo-kafka** (Messaging Layer)
**Purpose**: Kafka integration and messaging services

**Contains**:
- `KafkaConfig.java` - Kafka producer/consumer factory configuration
- `KafkaTopicConfig.java` - Topic creation and configuration
- `KafkaProducerService.java` - Message publishing service
- `KafkaConsumerService.java` - Message consumption service

**Dependencies**:
- `demo-common` (internal)
- `spring-kafka`
- `spring-boot-starter-data-mongodb`

**Package**: `com.example.demo.kafka.*`

---

### 3. **demo-api** (Web Layer)
**Purpose**: REST API and web configuration

**Contains**:
- `KafkaController.java` - REST endpoints for producer/consumer
- `CorsConfig.java` - CORS configuration for Angular migration

**Dependencies**:
- `demo-common` (internal)
- `demo-kafka` (internal)
- `spring-boot-starter-web`

**Package**: `com.example.demo.api.*`

**Endpoints**:
- `POST /api/kafka/produce` - Send message
- `GET /api/kafka/consume` - Get messages (simple)
- `GET /api/kafka/messages` - Get messages with metadata
- `DELETE /api/kafka/consume` - Clear all messages

---

### 4. **demo-app** (Main Application)
**Purpose**: Executable Spring Boot application that assembles all modules

**Contains**:
- `DemoApplication.java` - Main class with component scanning
- `application.properties` - Configuration files
- `static/` - Web UI resources (HTML, CSS, JS)
- `templates/` - Server-side templates

**Dependencies**:
- `demo-common` (internal)
- `demo-kafka` (internal)
- `demo-api` (internal)
- `spring-boot-starter-web`
- `spring-boot-starter-actuator`
- `spring-boot-devtools`

**Package**: `com.example.demo`

**Component Scanning**:
```java
@SpringBootApplication(scanBasePackages = {
    "com.example.demo",
    "com.example.demo.common",
    "com.example.demo.kafka",
    "com.example.demo.api"
})
@EnableMongoRepositories(basePackages = "com.example.demo.common.repository")
```

---

## 🏗️ Dependency Graph

```
demo-app
├── depends on → demo-api
│   ├── depends on → demo-kafka
│   │   └── depends on → demo-common
│   └── depends on → demo-common
├── depends on → demo-kafka
│   └── depends on → demo-common
└── depends on → demo-common
```

**Principle**: Higher-level modules depend on lower-level modules, never the reverse.

---

## 🚀 Building the Project

### Build All Modules
```bash
mvn clean install
```

### Build Specific Module
```bash
cd demo-common
mvn clean install
```

### Build Without Tests
```bash
mvn clean install -DskipTests
```

### Package for Deployment
```bash
mvn clean package
# Executable JAR: demo-app/target/demo-app-0.0.1-SNAPSHOT.jar
```

---

## 🏃 Running the Application

### Using Maven (Development)
```bash
cd demo-app
mvn spring-boot:run
```

### Using JAR (Production)
```bash
java -jar demo-app/target/demo-app-0.0.1-SNAPSHOT.jar
```

### Using Startup Script
```bash
./start.sh
```

### Using Docker Compose
```bash
docker compose up -d
```

---

## 🧪 Testing

### Run All Tests
```bash
mvn test
```

### Run Tests for Specific Module
```bash
cd demo-kafka
mvn test
```

### Integration Tests
```bash
mvn verify
```

---

## 📁 File Locations

### Source Code
- **Common**: `demo-common/src/main/java/com/example/demo/common/`
- **Kafka**: `demo-kafka/src/main/java/com/example/demo/kafka/`
- **API**: `demo-api/src/main/java/com/example/demo/api/`
- **App**: `demo-app/src/main/java/com/example/demo/`

### Resources
- **Properties**: `demo-app/src/main/resources/application.properties`
- **Web UI**: `demo-app/src/main/resources/static/`

### Build Output
- **Common JAR**: `demo-common/target/demo-common-0.0.1-SNAPSHOT.jar`
- **Kafka JAR**: `demo-kafka/target/demo-kafka-0.0.1-SNAPSHOT.jar`
- **API JAR**: `demo-api/target/demo-api-0.0.1-SNAPSHOT.jar`
- **Executable JAR**: `demo-app/target/demo-app-0.0.1-SNAPSHOT.jar` ⭐

---

## 🎯 Benefits of Multi-Module Architecture

### 1. **Separation of Concerns**
Each module has a single, well-defined responsibility:
- `demo-common`: Data layer
- `demo-kafka`: Messaging layer
- `demo-api`: Presentation layer
- `demo-app`: Application assembly

### 2. **Independent Development**
Teams can work on different modules simultaneously without conflicts.

### 3. **Reusability**
Modules can be shared across multiple projects:
```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>demo-kafka</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

### 4. **Clear Dependencies**
Maven enforces dependency direction, preventing circular dependencies.

### 5. **Faster Builds**
Only changed modules need to be rebuilt (with incremental compilation).

### 6. **Better Testing**
Each module can be tested in isolation with minimal dependencies.

### 7. **Easier Microservice Migration**
Modules can evolve into separate microservices:
- `demo-kafka` → Messaging Service
- `demo-api` → API Gateway

---

## 🔄 Migration from Monolith

### What Changed

**Before** (Monolithic):
```
src/main/java/com/example/demo/
├── DemoApplication.java
├── config/
├── controller/
├── model/
├── repository/
└── service/
```

**After** (Multi-Module):
```
demo-parent/
├── demo-common/
│   └── src/main/java/com/example/demo/common/
│       ├── model/
│       └── repository/
├── demo-kafka/
│   └── src/main/java/com/example/demo/kafka/
│       ├── config/
│       └── service/
├── demo-api/
│   └── src/main/java/com/example/demo/api/
│       ├── config/
│       └── controller/
└── demo-app/
    └── src/main/java/com/example/demo/
        └── DemoApplication.java
```

### Package Renaming
- `com.example.demo.model` → `com.example.demo.common.model`
- `com.example.demo.repository` → `com.example.demo.common.repository`
- `com.example.demo.service` → `com.example.demo.kafka.service`
- `com.example.demo.config` → Split:
  - Kafka configs → `com.example.demo.kafka.config`
  - CORS config → `com.example.demo.api.config`
- `com.example.demo.controller` → `com.example.demo.api.controller`

---

## 🛠️ Development Workflow

### Adding a New Feature

1. **Identify the module**: Determine which module the feature belongs to
2. **Add code**: Implement in the appropriate module
3. **Build module**: `mvn clean install` in that module
4. **Test**: Run tests for affected modules
5. **Build app**: Rebuild `demo-app` to include changes

### Adding a New Module

1. Create module directory: `mkdir demo-newmodule`
2. Create `pom.xml` with parent reference
3. Add module to parent `pom.xml` `<modules>` section
4. Add module dependency to consumers
5. Build: `mvn clean install`

---

## 📚 Best Practices

### 1. **Keep Modules Focused**
Each module should have a single, clear purpose.

### 2. **Minimize Cross-Module Communication**
Reduce coupling by using well-defined interfaces.

### 3. **Version Management**
Use `${project.version}` for internal module dependencies.

### 4. **Consistent Naming**
Follow convention: `demo-{layer}` (common, kafka, api, app).

### 5. **Document Module Boundaries**
Clearly define what belongs in each module.

### 6. **Test Module Isolation**
Ensure modules can be tested independently.

---

## 🐳 Docker Build

The Dockerfile has been updated for multi-module builds:

```dockerfile
# Copy all POMs
COPY pom.xml .
COPY demo-common/pom.xml demo-common/
COPY demo-kafka/pom.xml demo-kafka/
COPY demo-api/pom.xml demo-api/
COPY demo-app/pom.xml demo-app/

# Copy all source code
COPY demo-common/src demo-common/src
COPY demo-kafka/src demo-kafka/src
COPY demo-api/src demo-api/src
COPY demo-app/src demo-app/src

# Build
RUN mvn clean package -DskipTests

# Copy final JAR
COPY --from=build /app/demo-app/target/demo-app-0.0.1-SNAPSHOT.jar app.jar
```

---

## 📖 Additional Documentation

- **12-Factor Compliance**: See [12-FACTOR-COMPLIANCE.md](12-FACTOR-COMPLIANCE.md)
- **Angular Migration**: See [ANGULAR_MIGRATION.md](ANGULAR_MIGRATION.md)
- **Micro Frontend**: See [MICRO-FRONTEND.md](MICRO-FRONTEND.md)
- **Main README**: See [README.md](../README.md)

---

## ❓ Troubleshooting

### Module Not Found
```
mvn clean install
# Rebuild all modules
```

### Circular Dependency
Review dependency graph - higher modules should depend on lower modules only.

### Class Not Found
Ensure component scanning includes all module packages in `DemoApplication.java`.

### Version Mismatch
All modules should use `${project.version}` for consistency.

---

## 🎓 Learning Resources

- [Maven Multi-Module Projects](https://maven.apache.org/guides/mini/guide-multiple-modules.html)
- [Spring Boot Multi-Module](https://spring.io/guides/gs/multi-module/)
- [Modular Monolith Architecture](https://www.martinfowler.com/articles/modular-monolith.html)

---

**Architecture**: Multi-Module Maven  
**Language**: Java 21  
**Framework**: Spring Boot 4.0.2  
**Build Tool**: Maven 3.9+  
**Modules**: 4 (common, kafka, api, app)
