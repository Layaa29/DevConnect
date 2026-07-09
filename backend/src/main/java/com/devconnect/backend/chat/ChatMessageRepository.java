package com.devconnect.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    List<ChatMessageEntity> findByRoomIdOrderByTimestampAsc(String roomId);

    List<ChatMessageEntity> findByReceiverIdAndIsReadFalse(Long receiverId);

    List<ChatMessageEntity> findByRoomIdAndReceiverIdAndIsReadFalse(String roomId, Long receiverId);
}
