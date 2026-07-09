package com.devconnect.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    private static final String UPLOAD_DIR = "uploads/posts";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    public static class UploadResult {
        private final boolean success;
        private final String mediaUrl;
        private final String mediaType;
        private final String message;
        private final int status;

        public UploadResult(boolean success, String mediaUrl, String mediaType, String message, int status) {
            this.success = success;
            this.mediaUrl = mediaUrl;
            this.mediaType = mediaType;
            this.message = message;
            this.status = status;
        }

        public boolean isSuccess() { return success; }
        public String getMediaUrl() { return mediaUrl; }
        public String getMediaType() { return mediaType; }
        public String getMessage() { return message; }
        public int getStatus() { return status; }
    }

    public UploadResult storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            logger.warn("Upload failed: File is empty or null");
            return new UploadResult(false, null, null, "File is empty.", 400);
        }

        // Validate size
        if (file.getSize() > MAX_FILE_SIZE) {
            logger.warn("Upload failed: File size {} exceeds 5MB limit", file.getSize());
            return new UploadResult(false, null, null, "File size exceeds 5MB limit.", 413);
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null) {
            logger.warn("Upload failed: Content type is null");
            return new UploadResult(false, null, null, "Unknown content type.", 400);
        }

        String ext = "";
        String mediaType = "";
        if (contentType.equals("image/jpeg") || contentType.equals("image/jpg")) {
            ext = ".jpg";
            mediaType = "IMAGE";
        } else if (contentType.equals("image/png")) {
            ext = ".png";
            mediaType = "IMAGE";
        } else if (contentType.equals("image/webp")) {
            ext = ".webp";
            mediaType = "IMAGE";
        } else if (contentType.equals("video/mp4")) {
            ext = ".mp4";
            mediaType = "VIDEO";
        } else if (contentType.equals("video/webm")) {
            ext = ".webm";
            mediaType = "VIDEO";
        } else {
            logger.warn("Upload failed: Unsupported MIME type {}", contentType);
            return new UploadResult(false, null, null, "Unsupported media type. Only JPG, JPEG, PNG, WEBP, MP4, and WEBM are allowed.", 400);
        }

        // Additional extension validation from original filename (sanitized)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String lowercaseName = originalFilename.toLowerCase();
            if (mediaType.equals("IMAGE")) {
                if (!lowercaseName.endsWith(".jpg") && !lowercaseName.endsWith(".jpeg") && 
                    !lowercaseName.endsWith(".png") && !lowercaseName.endsWith(".webp")) {
                    logger.warn("Upload failed: File extension does not match MIME type for {}", originalFilename);
                    return new UploadResult(false, null, null, "Invalid file extension for image.", 400);
                }
            } else if (mediaType.equals("VIDEO")) {
                if (!lowercaseName.endsWith(".mp4") && !lowercaseName.endsWith(".webm")) {
                    logger.warn("Upload failed: File extension does not match MIME type for {}", originalFilename);
                    return new UploadResult(false, null, null, "Invalid file extension for video.", 400);
                }
            }
        }

        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate secure UUID-based filename while keeping extension
            String uuidName = UUID.randomUUID().toString() + ext;
            File destFile = new File(uploadDir, uuidName);

            file.transferTo(destFile);

            logger.info("Upload success: Saved file as {} ({} bytes)", uuidName, file.getSize());
            return new UploadResult(true, "/uploads/posts/" + uuidName, mediaType, "Upload successful.", 200);

        } catch (IOException e) {
            logger.error("Upload failed due to disk write error", e);
            return new UploadResult(false, null, null, "Failed to write file to disk.", 500);
        }
    }

    public boolean deleteFile(String mediaUrl) {
        if (mediaUrl == null || !mediaUrl.startsWith("/uploads/posts/")) {
            return false;
        }
        try {
            String filename = mediaUrl.substring("/uploads/posts/".length());
            // Sanitize filename to prevent directory traversal
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                logger.warn("Security warning: Traversal attempt blocked in file deletion: {}", filename);
                return false;
            }
            File fileToDelete = new File(UPLOAD_DIR, filename);
            if (fileToDelete.exists()) {
                boolean deleted = fileToDelete.delete();
                if (deleted) {
                    logger.info("Cleanup success: Deleted media file {}", filename);
                } else {
                    logger.warn("Cleanup failed: Could not delete media file {}", filename);
                }
                return deleted;
            } else {
                logger.info("Cleanup info: File {} already missing on disk", filename);
                return true;
            }
        } catch (Exception e) {
            logger.error("Cleanup error during deletion of media", e);
            return false;
        }
    }
}
