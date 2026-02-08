# Kafka Producer & Consumer Demo

A **12-Factor compliant** Spring Boot application demonstrating Kafka producer and consumer functionality with MongoDB persistence and a modern web UI.

## 🏗️ 12-Factor App Principles

This application follows the [12-Factor App](https://12factor.net/) methodology:

1. **Codebase** - Single codebase tracked in Git
2. **Dependencies** - Explicitly declared in `pom.xml`
3. **Config** - All configuration via environment variables (no secrets in code)
4. **Backing Services** - Kafka & MongoDB treated as attached resources
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
- ✅ MongoDB persistence with Spring Data
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
- MongoDB Atlas account (or local MongoDB)
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
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE=kafka_demo

# Kafka (local or cloud)
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

### 2. Start Kafka

Using Docker Compose:
```bash
docker-compose up -d
```

### 3. Load Environment & Run

**Option A: Using the startup script (Recommended)**
```bash
chmod +x start.sh
./start.sh
```

**Option B: Manual setup**
```bash
# Load environment variables
export $(cat .env.dev | grep -v '^#' | xargs)

# Build and run
./mvnw clean package
./mvnw spring-boot:run
```

**Option C: Using Docker**
```bash
docker build -t kafka-demo .
docker run -p 8080:8080 --env-file .env.dev kafka-demo
```

### 4. Access the Application

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
| `MONGODB_URI` | - | MongoDB connection string |
| `MONGODB_DATABASE` | kafka_demo | MongoDB database name |
| `KAFKA_BOOTSTRAP_SERVERS` | localhost:9092 | Kafka broker addresses |
| `KAFKA_CONSUMER_GROUP_ID` | demo-group | Consumer group ID |
| `KAFKA_TOPIC_NAME` | demo-topic | Kafka topic name |
| `CORS_ALLOWED_ORIGINS` | localhost:4200,* | Allowed CORS origins |
| `LOG_LEVEL` | INFO | Application log level |
| `SPRING_PROFILES_ACTIVE` | - | Active Spring profile (dev/prod) |

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
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongo-secret
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

# MongoDB health
curl http://localhost:8080/actuator/health/mongo

# Metrics
curl http://localhost:8080/actuator/metrics
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use secrets management** - Vault, AWS Secrets Manager, etc.
3. **Rotate credentials regularly** - MongoDB and Kafka passwords
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
│   └── Message.java                 # MongoDB document
├── repository/
│   └── MessageRepository.java       # MongoDB repository
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

**MongoDB Connection Error:**
- Verify `MONGODB_URI` in `.env.dev`
- Check network connectivity to MongoDB Atlas
- Ensure IP whitelist in MongoDB Atlas includes your IP

**CORS Issues with Angular:**
- Verify `CORS_ALLOWED_ORIGINS` includes `http://localhost:4200`
- Check browser console for specific CORS errors
- Ensure Angular runs on port 4200

**Environment Variables Not Loading:**
- On Mac/Linux: `export $(cat .env.dev | grep -v '^#' | xargs)`
- On Windows: Use `.env.dev` contents to set variables manually
- Or use Spring profile: `SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run`

## 📚 Technologies Used

- **Spring Boot 4.0.2** - Application framework
- **Spring Kafka** - Kafka integration
- **Spring Data MongoDB** - MongoDB persistence
- **Spring Actuator** - Health checks and monitoring
- **Apache Kafka** - Message streaming
- **MongoDB Atlas** - Cloud database
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
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Angular Documentation](https://angular.io/docs)
- [Docker Documentation](https://docs.docker.com/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review application logs: `./mvnw spring-boot:run`

---

Built with ❤️ following 12-Factor App principles

- Clear all messages with one click
- Auto-refresh functionality

## API Endpoints

### Produce Message
```
POST /api/kafka/produce
Content-Type: application/json

{
  "message": "Your message here",
  "key": "optional-key"
}
```

### Get Consumed Messages
```
GET /api/kafka/consume
```

### Clear Messages
```
DELETE /api/kafka/consume
```

## Configuration

Edit `src/main/resources/application.properties` to customize:

```properties
# Kafka broker address
spring.kafka.bootstrap-servers=localhost:9092

# Consumer group ID
spring.kafka.consumer.group-id=demo-group

# Topic name
kafka.topic.name=demo-topic
```

## Project Structure

```
src/main/java/com/example/demo/
├── DemoApplication.java              # Main application class
├── config/
│   └── KafkaTopicConfig.java        # Kafka topic configuration
├── controller/
│   └── KafkaController.java         # REST API endpoints
└── service/
    ├── KafkaProducerService.java    # Message producer logic
    └── KafkaConsumerService.java    # Message consumer logic

src/main/resources/
├── application.properties            # Application configuration
└── static/
    └── index.html                    # Web UI
```

## Testing the Application

1. Start Kafka (using Docker or local installation)
2. Run the Spring Boot application
3. Open http://localhost:8080 in your browser
4. Type a message and click "Send Message"
5. Watch the message appear in the Consumer panel on the right
6. Try sending multiple messages to see them accumulate
7. Use message keys to test partitioning

## Tips

- Use Ctrl+Enter in the message textarea to quickly send messages
- The consumer auto-refreshes every 2 seconds
- Messages are limited to the last 100 to prevent memory issues
- Check the application logs for detailed Kafka events

## Troubleshooting

**Kafka Connection Error:**
- Ensure Kafka is running on `localhost:9092`
- Check if Zookeeper is running
- Verify firewall settings

**Messages not appearing:**
- Check browser console for errors
- Verify the topic name in configuration
- Check application logs for consumer errors

## Technologies Used

- Spring Boot 4.0.2
- Spring Kafka
- Apache Kafka
- HTML/CSS/JavaScript
- Maven
