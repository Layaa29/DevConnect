package com.devconnect.backend.controller;

import com.devconnect.backend.dto.LoginRequest;
import com.devconnect.backend.dto.LoginResponse;
import com.devconnect.backend.entity.User;
import com.devconnect.backend.jwt.JwtUtil;
import com.devconnect.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public LoginResponse loginUser(@RequestBody LoginRequest request) {

        String email = userService.loginUser(request);

        String token = jwtUtil.generateToken(email);

        User user = userService.getUserByEmail(email);

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    @GetMapping("/")
    public String test() {
        return "User API Working";
    }
}