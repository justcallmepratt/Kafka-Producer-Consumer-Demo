package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing a Kafka message.
 */
@Document(collection = "messages")
public class Message {

    @Id
    private String id;
    
    private String content;
    private String key;
    private LocalDateTime timestamp;
    private String topic;

    public Message() {
    }

    public Message(String content, String key, String topic) {
        this.content = content;
        this.key = key;
        this.topic = topic;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    @Override
    public String toString() {
        return "Message{" +
                "id='" + id + '\'' +
                ", content='" + content + '\'' +
                ", key='" + key + '\'' +
                ", timestamp=" + timestamp +
                ", topic='" + topic + '\'' +
                '}';
    }
}
