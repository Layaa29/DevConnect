package com.devconnect.backend.post;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByTimestampDesc();

    boolean existsByAuthorIdAndOriginalPostId(Long authorId, Long originalPostId);

    java.util.Optional<Post> findByAuthorIdAndOriginalPostId(Long authorId, Long originalPostId);

    List<Post> findByOriginalPostId(Long originalPostId);
}
