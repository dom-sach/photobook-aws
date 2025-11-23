package com.example.guestbook.service;

import com.example.guestbook.model.Comment;
import com.example.guestbook.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository repo;

    public CommentService(CommentRepository repo) {
        this.repo = repo;
    }

    public List<Comment> getCommentsForImage(String imageId) {
        return repo.findByImageIdOrderByCreatedAtDesc(imageId);
    }

    public Comment addComment(String imageId, String text, String email) {
        Comment c = new Comment(text, email, imageId);
        return repo.save(c);
    }
}
