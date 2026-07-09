package com.devconnect.backend.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/history/{userId}/{otherUserId}")
    public List<ChatMessageEntity> getHistory(
            @PathVariable Long userId,
            @PathVariable Long otherUserId) {
        return chatService.getHistory(userId, otherUserId);
    }

    @PutMapping("/read/{userId}/{otherUserId}")
    public void markAsRead(
            @PathVariable Long userId,
            @PathVariable Long otherUserId) {
        chatService.markAsRead(userId, otherUserId);
    }

    @GetMapping("/unread/{userId}")
    public List<ChatMessageEntity> getUnreadMessages(
            @PathVariable Long userId) {
        return chatService.getUnreadMessages(userId);
    }
}
