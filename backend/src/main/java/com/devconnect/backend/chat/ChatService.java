package com.devconnect.backend.chat;

import com.devconnect.backend.entity.User;
import com.devconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatMessageEntity saveMessage(ChatMessage message) {
        User sender = userRepository.findById(message.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        ChatMessageEntity entity = new ChatMessageEntity();
        entity.setSenderId(message.getSenderId());
        entity.setSenderName(sender.getName());
        entity.setReceiverId(message.getReceiverId());
        entity.setContent(message.getContent());
        entity.setRoomId(buildRoomId(message.getSenderId(), message.getReceiverId()));
        entity.setTimestamp(LocalDateTime.now());

        return chatMessageRepository.save(entity);
    }

    public List<ChatMessageEntity> getHistory(Long userId, Long otherUserId) {
        String roomId = buildRoomId(userId, otherUserId);
        return chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
    }

    public void markAsRead(Long userId, Long otherUserId) {
        String roomId = buildRoomId(userId, otherUserId);
        List<ChatMessageEntity> unread = chatMessageRepository
                .findByRoomIdAndReceiverIdAndIsReadFalse(roomId, userId);
        for (ChatMessageEntity msg : unread) {
            msg.setRead(true);
        }
        chatMessageRepository.saveAll(unread);
    }

    public List<ChatMessageEntity> getUnreadMessages(Long userId) {
        return chatMessageRepository.findByReceiverIdAndIsReadFalse(userId);
    }

    public static String buildRoomId(Long userId1, Long userId2) {
        long min = Math.min(userId1, userId2);
        long max = Math.max(userId1, userId2);
        return min + "_" + max;
    }
}
