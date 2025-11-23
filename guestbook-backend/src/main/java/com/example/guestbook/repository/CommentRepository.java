package com.example.guestbook.repository;

import com.example.guestbook.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByImageIdOrderByCreatedAtDesc(String imageId);
}
