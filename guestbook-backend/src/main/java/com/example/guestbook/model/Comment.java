package com.example.guestbook.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;


@Setter
@Getter
@Entity
public class Comment {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false, length = 500)
    private String text;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private String authorEmail;

    @Column(nullable = false)
    private String imageId;

    public Comment() {
        this.id = UUID.randomUUID().toString();
    }

    public Comment(String text, String authorEmail, String imageId) {
        this.id = UUID.randomUUID().toString();
        this.text = text;
        this.authorEmail = authorEmail;
        this.imageId = imageId;
        this.createdAt = Instant.now();
    }

}
