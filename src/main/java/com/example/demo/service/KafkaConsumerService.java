package com.example.demo.service;

import com.example.demo.model.Message;
import com.example.demo.repository.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for consuming messages from Kafka topics.
 * Messages are persisted to MongoDB for permanent storage.
 */
@Service
public class KafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);

    private final MessageRepository messageRepository;

    @Value("${kafka.topic.name}")
    private String topicName;

    public KafkaConsumerService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    /**
     * Listens to the configured Kafka topic and processes incoming messages.
     * Saves each message to MongoDB with metadata.
     *
     * @param messageContent The consumed message content
     * @param key The message key (if present)
     */
    @KafkaListener(topics = "${kafka.topic.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void consume(@Payload String messageContent,
                       @Header(value = KafkaHeaders.RECEIVED_KEY, required = false) String key) {
        logger.info("Consumed message: {} with key: {}", messageContent, key);
        
        // Create and save message to MongoDB
        Message message = new Message(messageContent, key, topicName);
        messageRepository.save(message);
        
        logger.info("Message saved to MongoDB: {}", message);
    }

    /**
     * Returns all consumed messages from MongoDB.
     *
     * @return List of message contents
     */
    public List<String> getConsumedMessages() {
        return messageRepository.findTop100ByOrderByTimestampDesc()
                .stream()
                .map(Message::getContent)
                .collect(Collectors.toList());
    }

    /**
     * Returns all message entities from MongoDB.
     *
     * @return List of Message entities
     */
    public List<Message> getAllMessages() {
        return messageRepository.findTop100ByOrderByTimestampDesc();
    }

    /**
     * Clears all consumed messages from MongoDB.
     */
    public void clearMessages() {
        messageRepository.deleteAll();
        logger.info("Cleared all messages from MongoDB");
    }
}
