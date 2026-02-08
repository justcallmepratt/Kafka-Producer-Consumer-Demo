package com.example.demo.api.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.common.model.Message;
import com.example.demo.kafka.service.KafkaConsumerService;
import com.example.demo.kafka.service.KafkaProducerService;

/**
 * REST controller for Kafka producer and consumer operations.
 * Provides endpoints for the web UI to interact with Kafka and MongoDB.
 */
@RestController
@RequestMapping("/api/kafka")
public class KafkaController {

    private final KafkaProducerService producerService;
    private final KafkaConsumerService consumerService;

    public KafkaController(KafkaProducerService producerService, KafkaConsumerService consumerService) {
        this.producerService = producerService;
        this.consumerService = consumerService;
    }

    /**
     * Endpoint to send a message to Kafka.
     *
     * @param request Map containing the message to send
     * @return Response with success status
     */
    @PostMapping("/produce")
    public ResponseEntity<Map<String, String>> produceMessage(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String key = request.get("key");

        if (message == null || message.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Message cannot be empty");
            return ResponseEntity.badRequest().body(error);
        }

        if (key != null && !key.trim().isEmpty()) {
            producerService.sendMessage(key, message);
        } else {
            producerService.sendMessage(message);
        }

        Map<String, String> response = new HashMap<>();
        response.put("status", "Message sent successfully");
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint to retrieve all consumed messages (simple string format).
     *
     * @return List of consumed message contents
     */
    @GetMapping("/consume")
    public ResponseEntity<List<String>> getConsumedMessages() {
        return ResponseEntity.ok(consumerService.getConsumedMessages());
    }

    /**
     * Endpoint to retrieve all consumed messages with full details.
     *
     * @return List of Message entities with metadata
     */
    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(consumerService.getAllMessages());
    }

    /**
     * Endpoint to clear all consumed messages from MongoDB.
     *
     * @return Response with success status
     */
    @DeleteMapping("/consume")
    public ResponseEntity<Map<String, String>> clearMessages() {
        consumerService.clearMessages();
        Map<String, String> response = new HashMap<>();
        response.put("status", "Messages cleared successfully from MongoDB");
        return ResponseEntity.ok(response);
    }
}
