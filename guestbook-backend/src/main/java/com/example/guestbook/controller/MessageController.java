package com.example.guestbook.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.guestbook.dto.CreateMessageRequest;
import com.example.guestbook.model.Message;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private static final Logger log = LoggerFactory.getLogger(MessageController.class);

    private final Map<Long, Message> store = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong(1);

    @GetMapping
    public List<Message> list() {
        return new ArrayList<>(store.values());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getOne(@PathVariable("id") Long id) {
        Message m = store.get(id);
        return (m == null) ? ResponseEntity.notFound().build() : ResponseEntity.ok(m);
    }

    @PostMapping
    public Message create(@RequestBody CreateMessageRequest req) {
        Long id = seq.getAndIncrement();
        Message m = new Message(id, req.author, req.text);
        store.put(id, m);
        // 👇 proste logowanie:
        log.info("New message created: id={}, author='{}', text='{}'", id, req.author, req.text);
        return m;
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String,Object>> like(@PathVariable("id") Long id) {
        if (!store.containsKey(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("status","ok","messageId", id));
    }
}
