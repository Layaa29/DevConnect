package com.devconnect.backend.connection;

import com.devconnect.backend.dto.ConnectionDetailDto;
import com.devconnect.backend.entity.User;
import com.devconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConnectionService {

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private UserRepository userRepository;

    public ConnectionRequest sendRequest(ConnectionRequest request) {

        boolean exists = connectionRepository
                .findBySenderIdAndReceiverId(
                        request.getSenderId(),
                        request.getReceiverId()
                )
                .isPresent() || connectionRepository
                .findBySenderIdAndReceiverId(
                        request.getReceiverId(),
                        request.getSenderId()
                )
                .isPresent();

        if (exists) {
            throw new RuntimeException("Connection request already exists");
        }

        if (request.getSenderId().equals(request.getReceiverId())) {
            throw new RuntimeException("Cannot connect with yourself");
        }

        request.setStatus("PENDING");

        return connectionRepository.save(request);
    }

    public List<ConnectionDetailDto> getPendingRequests(Long receiverId) {
        return connectionRepository
                .findByReceiverIdAndStatus(receiverId, "PENDING")
                .stream()
                .map(this::toDetailDto)
                .toList();
    }

    public ConnectionRequest acceptRequest(Long requestId) {
        ConnectionRequest request = connectionRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus("ACCEPTED");

        return connectionRepository.save(request);
    }

    public ConnectionRequest rejectRequest(Long requestId) {
        ConnectionRequest request = connectionRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        connectionRepository.delete(request);

        return request;
    }

    public List<ConnectionDetailDto> getAcceptedConnections(Long userId) {
        return connectionRepository
                .findByStatusAndUser("ACCEPTED", userId)
                .stream()
                .map(this::toDetailDto)
                .toList();
    }

    public List<ConnectionRequest> getAllRelationsForUser(Long userId) {
        return connectionRepository.findBySenderIdOrReceiverId(userId, userId);
    }

    private ConnectionDetailDto toDetailDto(ConnectionRequest request) {
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        return new ConnectionDetailDto(
                request.getId(),
                request.getSenderId(),
                sender.getName(),
                request.getReceiverId(),
                receiver.getName(),
                request.getStatus()
        );
    }
}
