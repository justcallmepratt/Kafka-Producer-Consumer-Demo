# Build stage (12-Factor: Separate build/run stages)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage (12-Factor: Stateless processes)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR from build stage
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

# 12-Factor: Port binding
EXPOSE ${PORT:-8080}

# 12-Factor: Disposability - fast startup and graceful shutdown
ENTRYPOINT ["java", "-jar", "app.jar"]
