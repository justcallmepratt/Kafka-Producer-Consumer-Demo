package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * Main application class for the Kafka Messaging Platform.
 * Modular architecture with separate modules for:
 * - demo-common: Domain models and repositories
 * - demo-kafka: Kafka configuration and services
 * - demo-api: REST controllers and web configuration
 * - demo-app: Main executable application
 */
@SpringBootApplication(scanBasePackages = {
	"com.example.demo",
	"com.example.demo.common",
	"com.example.demo.kafka",
	"com.example.demo.api"
})
@EnableMongoRepositories(basePackages = "com.example.demo.common.repository")
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
