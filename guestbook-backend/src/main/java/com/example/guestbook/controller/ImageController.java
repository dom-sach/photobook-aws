package com.example.guestbook.controller;

import com.example.guestbook.model.ImageMetadata;
import com.example.guestbook.repository.ImageMetadataRepository;
import com.example.guestbook.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;
    private final ImageMetadataRepository repo;

    // upload nowego obrazka
    @PostMapping
    public ResponseEntity<?> uploadImage(@RequestPart("file") MultipartFile file,
                                         @RequestPart("caption") String caption,
                                         Principal principal) {
        try {
            String userEmail = principal.getName(); // lub z innego źródła autoryzacji
            ImageMetadata metadata = imageService.upload(file, caption, userEmail);
            String url = imageService.getUrl(metadata.getFilename());
            Map<String, Object> response = new HashMap<>();
            response.put("id", metadata.getId());
            response.put("filename", metadata.getFilename());
            response.put("caption", metadata.getCaption());
            response.put("uploadTime", metadata.getUploadTime());
            response.put("url", url);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Błąd podczas uploadu: " + e.getMessage());
        }
    }

    // zwraca listę wszystkich obrazków (metadanych)
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listImages() {
        List<ImageMetadata> images = repo.findAllByOrderByUploadTimeDesc();
        List<Map<String, Object>> response = images.stream().map(img -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", img.getId());
            map.put("filename", img.getFilename());
            map.put("caption", img.getCaption());
            map.put("uploadTime", img.getUploadTime());
            map.put("url", imageService.getUrl(img.getFilename()));
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // pobieranie obrazka po filename
    @GetMapping("/{filename}")
    public ResponseEntity<?> getImage(@PathVariable String filename) {
        try {
            return imageService.downloadImage(filename);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}