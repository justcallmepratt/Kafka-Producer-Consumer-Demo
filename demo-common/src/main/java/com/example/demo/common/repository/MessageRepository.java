package com.example.demo.common.repository;

import com.example.demo.common.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA repository for stored messages.
 * Provides CRUD operations and custom query methods.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

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
