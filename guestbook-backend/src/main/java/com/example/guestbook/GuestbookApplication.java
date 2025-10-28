package com.example.guestbook;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GuestbookApplication {

	public static void main(String[] args) {
		SpringApplication.run(GuestbookApplication.class, args);
	}

	@PostConstruct
	public void printAwsCreds() {
		System.out.println("AWS_ACCESS_KEY_ID: " + System.getenv("AWS_ACCESS_KEY_ID"));
	}

}
