package com.devconnect.backend.dto;

public class ConnectionDetailDto {

    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private String status;

    public ConnectionDetailDto(
            Long id,
            Long senderId,
            String senderName,
            Long receiverId,
            String receiverName,
            String status) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.receiverName = receiverName;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public String getStatus() {
        return status;
    }
}
