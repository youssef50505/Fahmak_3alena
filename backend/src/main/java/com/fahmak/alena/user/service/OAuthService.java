package com.fahmak.alena.user.service;

import com.fahmak.alena.user.dto.AuthResponse;
import com.fahmak.alena.user.entity.AuthProvider;
import com.fahmak.alena.user.entity.Role;
import com.fahmak.alena.user.entity.User;
import com.fahmak.alena.user.repository.UserRepository;
import com.fahmak.alena.user.security.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${google.client.id:not-configured}")
    private String googleClientId;

    @Transactional
    public AuthResponse authenticateWithGoogle(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new RuntimeException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = token.getPayload();
            String email = payload.getEmail();
            String googleId = payload.getSubject();
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");
            String avatar = (String) payload.get("picture");

            User user = findOrCreateUser(email, googleId, AuthProvider.GOOGLE, firstName, lastName, avatar);
            
            user.setLastLoginDate(LocalDateTime.now());
            userRepository.save(user);
            String jwt = jwtService.generateToken(user);

            return AuthResponse.builder()
                    .message("Login successful")
                    .token(jwt)
                    .userId(user.getId())
                    .role(user.getRole().name())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .build();
        } catch (Exception e) {
            log.error("Google authentication failed", e);
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    private User findOrCreateUser(String email, String providerId, AuthProvider provider, String firstName, String lastName, String avatar) {
        return userRepository.findByProviderIdAndAuthProvider(providerId, provider)
                .orElseGet(() -> {
                    Optional<User> existingByEmail = userRepository.findByEmail(email);
                    if (existingByEmail.isPresent()) {
                        User existing = existingByEmail.get();
                        existing.setAuthProvider(provider);
                        existing.setProviderId(providerId);
                        existing.setAvatarUrl(avatar);
                        return userRepository.save(existing);
                    }
                    
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(email.split("@")[0]);
                    newUser.setFirstName(firstName);
                    newUser.setLastName(lastName);
                    newUser.setRole(Role.STUDENT);
                    newUser.setAuthProvider(provider);
                    newUser.setProviderId(providerId);
                    newUser.setAvatarUrl(avatar);
                    newUser.setRegistrationDate(LocalDateTime.now());
                    newUser.setStatus("ACTIVE");
                    return userRepository.save(newUser);
                });
    }
}
