package com.example.guestbook.controller;

import com.example.guestbook.dto.AddCommentRequest;
import com.example.guestbook.dto.CommentResponse;
import com.example.guestbook.model.Comment;
import com.example.guestbook.service.CommentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/images/{imageId}/comments")
public class CommentController {

    private final CommentService service;

    public CommentController(CommentService service) {
        this.service = service;
    }

    // pobranie komentarzy do obrazka
    @GetMapping
    public List<CommentResponse> getComments(@PathVariable("imageId") String imageId) {
        List<Comment> comments = service.getCommentsForImage(imageId);
        return comments.stream()
                .map(c -> new CommentResponse(
                        c.getId(),
                        c.getText(),
                        c.getAuthorEmail(),
                        c.getCreatedAt()
                ))
                .toList();
    }

    // dodanie komentarza
    @PostMapping
    public CommentResponse addComment(
            @PathVariable("imageId") String imageId,
            @RequestBody AddCommentRequest request,
            Authentication auth
    ) {
        Comment saved = service.addComment(imageId, request.text, auth.getName());
        return new CommentResponse(
                saved.getId(),
                saved.getText(),
                saved.getAuthorEmail(),
                saved.getCreatedAt()
        );
    }
}
