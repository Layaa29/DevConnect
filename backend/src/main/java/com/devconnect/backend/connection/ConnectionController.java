package com.devconnect.backend.connection;

import com.devconnect.backend.dto.ConnectionDetailDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    @Autowired
    private ConnectionService connectionService;

    @PostMapping("/send")
    public ConnectionRequest sendRequest(@RequestBody ConnectionRequest request) {
        return connectionService.sendRequest(request);
    }

    @GetMapping("/pending/{receiverId}")
    public List<ConnectionDetailDto> getPendingRequests(@PathVariable Long receiverId) {
        return connectionService.getPendingRequests(receiverId);
    }

    @PutMapping("/accept/{requestId}")
    public ConnectionRequest acceptRequest(@PathVariable Long requestId) {
        return connectionService.acceptRequest(requestId);
    }

    @DeleteMapping("/reject/{requestId}")
    public ConnectionRequest rejectRequest(@PathVariable Long requestId) {
        return connectionService.rejectRequest(requestId);
    }

    @GetMapping("/accepted/{userId}")
    public List<ConnectionDetailDto> getAcceptedConnections(@PathVariable Long userId) {
        return connectionService.getAcceptedConnections(userId);
    }

    @GetMapping("/all-relations/{userId}")
    public List<ConnectionRequest> getAllRelationsForUser(@PathVariable Long userId) {
        return connectionService.getAllRelationsForUser(userId);
    }
}
