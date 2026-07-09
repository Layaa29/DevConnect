package com.devconnect.backend.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessage message) {
        ChatMessageEntity saved = chatService.saveMessage(message);
        messagingTemplate.convertAndSend(
                "/topic/chat." + saved.getRoomId(),
                saved
        );
    }
}
