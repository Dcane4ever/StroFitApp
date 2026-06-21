package com.strofit.backend.auth.dto;

import com.strofit.backend.user.User;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private UUID userId;
    private String email;
    private String role;
    private String displayName;

    public static AuthResponse of(String token, User user, String displayName) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .displayName(displayName)
                .build();
    }
}
