package com.example.guestbook.controller;

import com.example.guestbook.dto.UserProfileRequest;
import com.example.guestbook.model.UserProfile;
import com.example.guestbook.repository.UserProfileRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserProfileRepository repo;

    public UserProfileController(UserProfileRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public UserProfile getProfile(Authentication authentication) {
        String email = authentication.getName();

        return repo.findById(email).orElseGet(() -> {
            UserProfile p = new UserProfile();
            p.setEmail(email);
            p.setBio("");
            p.setFavoriteColor("");
            return repo.save(p);
        });
    }

    @PostMapping
    public UserProfile updateProfile(@RequestBody UserProfileRequest request,
                                     Authentication authentication) {

        String email = authentication.getName();
        UserProfile profile = repo.findById(email).orElse(new UserProfile());
        profile.setEmail(email);
        profile.setBio(request.getBio());
        profile.setFavoriteColor(request.getFavoriteColor());
        return repo.save(profile);
    }
}
