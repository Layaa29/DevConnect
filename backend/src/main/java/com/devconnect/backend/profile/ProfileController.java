package com.devconnect.backend.profile;

import com.devconnect.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return profileService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return profileService.getUserById(id);
    }
    @GetMapping("/search")
public List<User> searchUsers(@RequestParam String name) {
    return profileService.searchUsers(name);
}

    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        return profileService.updateUser(id, user);
    }
}