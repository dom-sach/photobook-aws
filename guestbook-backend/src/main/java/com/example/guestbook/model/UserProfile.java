package com.example.guestbook.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Data
public class UserProfile {

    @Id
    private String email; // pobieramy z tokena Cognito jako klucz, takie uproszczenie

    private String bio;
    private String favoriteColor;
}
