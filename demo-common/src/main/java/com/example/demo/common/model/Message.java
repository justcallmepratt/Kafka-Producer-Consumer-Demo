package com.example.demo.common.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

/**
 * A consumed Kafka message, stored in PostgreSQL.
 *
 * The JSON shape ({id, content, key, timestamp, topic}) is the API contract;
 * the column names differ where the property name is awkward in SQL.
 */
@Entity
@Table(name = "kafka_demo_messages",
        indexes = @Index(name = "kafka_demo_messages_created_at_idx", columnList = "created_at"))
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "message_key", length = 512)
    private String key;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 255)
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
