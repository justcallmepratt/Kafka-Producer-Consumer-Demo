package com.example.demo.common.repository;

import com.example.demo.common.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB repository for Message documents.
 * Provides CRUD operations and custom query methods.
 */
@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    /**
     * Find all messages ordered by timestamp in descending order (newest first).
     */
    List<Message> findAllByOrderByTimestampDesc();

    /**
     * Find messages by topic.
     */
    List<Message> findByTopicOrderByTimestampDesc(String topic);

    /**
     * Find the most recent messages (limited).
     */
    List<Message> findTop100ByOrderByTimestampDesc();
}
