#!/bin/bash

# Alternative startup script without Docker
# For running Kafka locally instead of with Docker Compose

set -e

echo "🚀 Starting Kafka Demo Application (No Docker Mode)..."

# Check if .env.dev exists, load it
if [ -f .env.dev ]; then
    echo "📝 Loading environment variables from .env.dev"
    export $(cat .env.dev | grep -v '^#' | xargs)
else
    echo "⚠️  No .env.dev file found. Using default configuration."
fi

echo ""
echo "⚠️  NOTE: This script assumes you're using a cloud Kafka service or have Kafka running separately."
echo "   Your KAFKA_BOOTSTRAP_SERVERS is set to: ${KAFKA_BOOTSTRAP_SERVERS:-localhost:9092}"
echo ""
echo "   If you need to run Kafka locally WITHOUT Docker, follow these steps:"
echo "   1. Download Kafka: https://kafka.apache.org/downloads"
echo "   2. Extract and navigate to Kafka directory"
echo "   3. Start Zookeeper: bin/zookeeper-server-start.sh config/zookeeper.properties"
echo "   4. Start Kafka: bin/kafka-server-start.sh config/server.properties"
echo ""

read -p "   Continue with application startup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Build and run
echo "🔨 Building application..."
./mvnw clean package -DskipTests

echo "✅ Starting application on port ${PORT:-8080}..."
java -jar target/demo-0.0.1-SNAPSHOT.jar
