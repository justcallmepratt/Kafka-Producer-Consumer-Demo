#!/bin/bash

# Startup script for running the application
# 12-Factor App: Port binding and stateless processes

set -e

echo "🚀 Starting Kafka Demo Application..."

# Check if .env.dev exists, load it
if [ -f .env.dev ]; then
    echo "📝 Loading environment variables from .env.dev"
    export $(cat .env.dev | grep -v '^#' | xargs)
else
    echo "⚠️  No .env.dev file found. Using default configuration."
fi

# Check if Kafka is running
echo "🔍 Checking Kafka availability..."
if ! nc -z localhost 9092 2>/dev/null; then
    echo "⚠️  Kafka is not running on localhost:9092"
    echo "   Start it with: docker-compose up -d"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build and run
echo "🔨 Building application..."
./mvnw clean package -DskipTests

echo "✅ Starting application on port ${PORT:-8080}..."
java -jar target/demo-0.0.1-SNAPSHOT.jar
