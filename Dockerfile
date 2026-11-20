# Multi-stage Dockerfile for modular Spring Boot application
# Build stage (12-Factor: Separate build/run stages)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy parent POM and module POMs
COPY pom.xml .
COPY demo-common/pom.xml demo-common/
COPY demo-kafka/pom.xml demo-kafka/
COPY demo-api/pom.xml demo-api/
COPY demo-app/pom.xml demo-app/

# Download dependencies (cached layer)
RUN mvn dependency:go-offline

# Copy source code for all modules
COPY demo-common/src demo-common/src
COPY demo-kafka/src demo-kafka/src
COPY demo-api/src demo-api/src
COPY demo-app/src demo-app/src

# Build the application
RUN mvn clean package -DskipTests

# Run stage (12-Factor: Stateless processes)
FROM eclipse-temurin:26-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR from build stage (from demo-app module)
COPY --from=build /app/demo-app/target/demo-app-0.0.1-SNAPSHOT.jar app.jar

# 12-Factor: Port binding
EXPOSE ${PORT:-8080}

# 12-Factor: Disposability - fast startup and graceful shutdown
ENTRYPOINT ["java", "-jar", "app.jar"]
