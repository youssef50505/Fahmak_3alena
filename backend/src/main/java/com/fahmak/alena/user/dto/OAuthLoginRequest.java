package com.fahmak.alena.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthLoginRequest {
    @NotBlank(message = "Token is required")
    private String token;
}
