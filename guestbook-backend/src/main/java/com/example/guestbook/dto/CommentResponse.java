package com.example.guestbook.dto;
import java.time.Instant;

public record CommentResponse(
        String id,
        String text,
        String authorEmail,
        Instant createdAt
) {}
