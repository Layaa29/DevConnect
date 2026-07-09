package com.devconnect.backend.post;

import com.devconnect.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        FileStorageService.UploadResult result = fileStorageService.storeFile(file);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", result.isSuccess());
        response.put("message", result.getMessage());
        
        if (result.isSuccess()) {
            response.put("mediaUrl", result.getMediaUrl());
            response.put("mediaType", result.getMediaType());
            return ResponseEntity.ok(response);
        } else {
            HttpStatus status = HttpStatus.valueOf(result.getStatus());
            return ResponseEntity.status(status).body(response);
        }
    }

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        post.setTimestamp(LocalDateTime.now());

        if (post.getOriginalPost() != null && post.getOriginalPost().getId() != null) {
            Long referencedId = post.getOriginalPost().getId();
            Post original = postRepository.findById(referencedId)
                    .orElseThrow(() -> new com.devconnect.backend.exception.PostNotFoundException(
                            "The post you are trying to repost does not exist."
                    ));

            // Resolve to root original post to prevent nested repost chains
            Post rootOriginal = original;
            while (rootOriginal.getOriginalPost() != null) {
                rootOriginal = rootOriginal.getOriginalPost();
            }

            // Toggle repost status instead of throwing duplicate exception
            java.util.Optional<Post> existingRepost = postRepository.findByAuthorIdAndOriginalPostId(
                    post.getAuthorId(), rootOriginal.getId()
            );

            if (existingRepost.isPresent()) {
                Post repostToDelete = existingRepost.get();
                if (repostToDelete.getMediaUrl() != null) {
                    fileStorageService.deleteFile(repostToDelete.getMediaUrl());
                }
                postRepository.delete(repostToDelete);
                Post undoPlaceholder = new Post();
                undoPlaceholder.setId(-1L); // Special ID to indicate undo/delete
                return undoPlaceholder;
            }

            post.setOriginalPost(rootOriginal);
        }

        return postRepository.save(post);
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByTimestampDesc();
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new com.devconnect.backend.exception.PostNotFoundException("Post not found"));
        
        // Clean up media file if present
        if (post.getMediaUrl() != null) {
            fileStorageService.deleteFile(post.getMediaUrl());
        }

        // Delete all reposts of this post
        List<Post> reposts = postRepository.findByOriginalPostId(id);
        if (reposts != null && !reposts.isEmpty()) {
            for (Post r : reposts) {
                if (r.getMediaUrl() != null) {
                    fileStorageService.deleteFile(r.getMediaUrl());
                }
            }
            postRepository.deleteAll(reposts);
        }
        postRepository.delete(post);
    }
}
