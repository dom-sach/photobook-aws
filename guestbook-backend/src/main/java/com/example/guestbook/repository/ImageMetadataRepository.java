package com.example.guestbook.repository;

import com.example.guestbook.model.ImageMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageMetadataRepository extends JpaRepository<ImageMetadata, Long> {
    List<ImageMetadata> findAllByOrderByUploadTimeDesc();
}
