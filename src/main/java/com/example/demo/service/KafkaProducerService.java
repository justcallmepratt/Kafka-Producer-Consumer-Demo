package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Service for producing messages to Kafka topics.
 */
@Service
public class KafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaProducerService.class);

    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${kafka.topic.name}")
    private String topicName;

    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Sends a message to the configured Kafka topic.
     *
     * @param message The message to send
     */
    public void sendMessage(String message) {
        logger.info("Producing message: {}", message);

        CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topicName, message);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                logger.info("Message sent successfully: [{}] with offset: [{}]",
                        message,
                        result.getRecordMetadata().offset());
            } else {
                logger.error("Unable to send message: [{}] due to: {}", message, ex.getMessage());
            }
        });
    }

    /**
     * Sends a message with a specific key to the configured Kafka topic.
     *
     * @param key     The message key
     * @param message The message to send
     */
    public void sendMessage(String key, String message) {
        logger.info("Producing message with key: {} - message: {}", key, message);

        CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topicName, key, message);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                logger.info("Message sent successfully with key: [{}] - offset: [{}]",
                        key,
                        result.getRecordMetadata().offset());
            } else {
                logger.error("Unable to send message with key: [{}] due to: {}", key, ex.getMessage());
            }
        });
    }
}
