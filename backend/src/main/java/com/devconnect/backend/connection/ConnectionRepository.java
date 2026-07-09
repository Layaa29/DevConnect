package com.devconnect.backend.connection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository
        extends JpaRepository<ConnectionRequest, Long> {

    List<ConnectionRequest> findByReceiverIdAndStatus(
            Long receiverId,
            String status
    );

    Optional<ConnectionRequest> findBySenderIdAndReceiverId(
            Long senderId,
            Long receiverId
    );

    @org.springframework.data.jpa.repository.Query("SELECT c FROM ConnectionRequest c WHERE c.status = :status AND (c.senderId = :userId OR c.receiverId = :userId)")
    List<ConnectionRequest> findByStatusAndUser(
            @org.springframework.data.repository.query.Param("status") String status,
            @org.springframework.data.repository.query.Param("userId") Long userId
    );

    List<ConnectionRequest> findBySenderIdOrReceiverId(
            Long senderId,
            Long receiverId
    );
}