package com.example.guestbook.model;

import java.time.Instant;

public class Message {
    private Long id;
    private String author;
    private String text;
    private Instant createdAt = Instant.now();

    // getters/setters/constructors
    public Message() {}
    public Message(Long id, String author, String text) {
        this.id = id; this.author = author; this.text = text;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
