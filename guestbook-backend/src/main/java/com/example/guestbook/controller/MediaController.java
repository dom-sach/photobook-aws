package com.example.guestbook.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private static final Logger log = LoggerFactory.getLogger(MediaController.class);

    private final Path uploadDir = Path.of("uploads");

    public MediaController() throws IOException {
        Files.createDirectories(uploadDir);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestPart("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("Empty file");
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        Path target = uploadDir.resolve(filename);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        // 👇 proste logowanie:
        log.info("File uploaded: name='{}', size={}B, contentType={}", filename, file.getSize(), file.getContentType());

        return ResponseEntity.ok().body(
                java.util.Map.of("filename", filename, "url", "/api/media/" + filename));
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> download(@PathVariable("filename") String filename) throws IOException {
        Path p = uploadDir.resolve(filename);
        if (!Files.exists(p)) return ResponseEntity.notFound().build();
        FileSystemResource res = new FileSystemResource(p.toFile());
        String contentType = Files.probeContentType(p);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                .body(res);
    }
}