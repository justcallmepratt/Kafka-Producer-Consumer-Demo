#!/bin/bash

# Modular Build and Run Script
# Works with multi-module Maven project structure

set -e  # Exit on error

echo "🚀 Starting Kafka Messaging Platform (Modular Architecture)"
echo "=============================================================="

# Load environment variables
if [ -f .env.dev ]; then
    echo "📋 Loading development environment variables..."
    export $(cat .env.dev | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .env.dev not found. Using default environment variables."
fi

# Start Docker services (Kafka, Zookeeper)
echo ""
echo "🐳 Starting Kafka and Zookeeper with Docker Compose..."
docker compose up -d

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka to be ready..."
sleep 5

# Build multi-module project
echo ""
echo "🔨 Building multi-module Maven project..."
./mvnw clean package -DskipTests

# Check if build was successful
if [ ! -f "demo-app/target/demo-app-0.0.1-SNAPSHOT.jar" ]; then
    echo "❌ Build failed! JAR file not found."
    exit 1
fi

echo "✅ Build successful!"

# Run the application (from demo-app module)
echo ""
echo "🏃 Starting Spring Boot application..."
java -jar demo-app/target/demo-app-0.0.1-SNAPSHOT.jar

