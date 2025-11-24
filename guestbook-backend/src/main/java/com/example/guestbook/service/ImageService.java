package com.example.guestbook.service;

import com.example.guestbook.model.ImageMetadata;
import com.example.guestbook.repository.ImageMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;


@Service
@RequiredArgsConstructor
public class ImageService {

    private final AmazonS3 amazonS3;

    @Value("${MEDIA_BUCKET}")
    private String bucket;

    private final ImageMetadataRepository repo;

    // upload obrazu
    public ImageMetadata upload(MultipartFile file, String caption, String email) throws IOException {
        String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
        ObjectMetadata meta = new ObjectMetadata();
        meta.setContentLength(file.getSize());
        meta.setContentType(file.getContentType());

        amazonS3.putObject(bucket, filename, file.getInputStream(), meta);

        ImageMetadata metadata = new ImageMetadata();
        metadata.setFilename(filename);
        metadata.setCaption(caption);
        metadata.setUploaderEmail(email);
        metadata.setUploadTime(Instant.now());

        return repo.save(metadata);
    }

    public List<ImageMetadata> listAll() {
        return repo.findAllByOrderByUploadTimeDesc();
    }

    public String getUrl(String filename) {
        return amazonS3.getUrl(bucket, filename).toString();
    }

    // pobieranie obrazu
    public ResponseEntity<Resource> downloadImage(String filename) throws MalformedURLException {
        java.net.URL url = amazonS3.getUrl(bucket, filename);

        Resource resource = new UrlResource(url);
        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("Nie można odczytać pliku");
        }

        String contentType = "application/octet-stream";
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
