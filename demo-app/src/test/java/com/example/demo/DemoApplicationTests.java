package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.demo.common.model.Message;
import com.example.demo.common.repository.MessageRepository;

/** Boots the whole application against an in-memory database (no broker needed). */
@SpringBootTest(properties = {
	"spring.datasource.url=jdbc:h2:mem:demo;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
	"spring.datasource.username=sa",
	"spring.datasource.password=",
	"spring.jpa.hibernate.ddl-auto=create-drop"
})
class DemoApplicationTests {

	@Autowired
	private MessageRepository messages;

	@BeforeEach
	void clear() {
		messages.deleteAll();
	}

	@Test
	void contextLoads() {
		// Verifies that the application context loads successfully
	}

	@Test
	void storesAMessageWithAGeneratedId() {
		Message saved = messages.save(new Message("hello", "order-1", "demo-topic"));

		assertNotNull(saved.getId());
		Message found = messages.findById(saved.getId()).orElseThrow();
		assertEquals("hello", found.getContent());
		assertEquals("order-1", found.getKey());
		assertEquals("demo-topic", found.getTopic());
		assertNotNull(found.getTimestamp());
	}

	@Test
	void storesAMessageWithoutAKeyAndWithLongContent() {
		String longContent = "x".repeat(5000);
		Message saved = messages.save(new Message(longContent, null, "demo-topic"));

		Message found = messages.findById(saved.getId()).orElseThrow();
		assertEquals(null, found.getKey());
		assertEquals(5000, found.getContent().length());
	}

	@Test
	void returnsNewestFirstAndAtMostOneHundred() {
		LocalDateTime base = LocalDateTime.of(2026, 1, 1, 12, 0);
		for (int i = 0; i < 105; i++) {
			Message m = new Message("m" + i, "k", "demo-topic");
			m.setTimestamp(base.plusSeconds(i));
			messages.save(m);
		}

		List<Message> latest = messages.findTop100ByOrderByTimestampDesc();
		assertEquals(100, latest.size());
		assertEquals("m104", latest.get(0).getContent());
		assertEquals("m5", latest.get(99).getContent());
		assertTrue(latest.get(0).getTimestamp().isAfter(latest.get(1).getTimestamp()));
	}

	@Test
	void deleteAllClearsTheTable() {
		messages.save(new Message("hello", null, "demo-topic"));
		messages.deleteAll();
		assertEquals(0, messages.count());
	}

}
