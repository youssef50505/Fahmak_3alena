package com.fahmak.alena.user.controller;

import com.fahmak.alena.user.dto.UpdateProfileRequest;
import com.fahmak.alena.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        
        return userService.findByEmail(authentication.getName())
                .map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "firstName", user.getFirstName(),
                        "lastName", user.getLastName(),
                        "role", user.getRole().name()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }

        return userService.findByEmail(authentication.getName())
                .map(user -> {
                    userService.updateProfile(user, request.getFirstName(), request.getLastName());
                    return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
