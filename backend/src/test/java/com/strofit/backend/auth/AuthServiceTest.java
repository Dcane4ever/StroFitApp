package com.strofit.backend.auth;

import com.strofit.backend.auth.dto.RegisterRequest;
import com.strofit.backend.auth.dto.AuthResponse;
import com.strofit.backend.common.exception.ConflictException;
import com.strofit.backend.profile.UserProfile;
import com.strofit.backend.profile.UserProfileService;
import com.strofit.backend.profile.dto.UserProfileResponse;
import com.strofit.backend.security.JwtService;
import com.strofit.backend.user.User;
import com.strofit.backend.user.UserRepository;
import com.strofit.backend.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock UserProfileService profileService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthService authService;

    private RegisterRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new RegisterRequest();
        validRequest.setEmail("test@example.com");
        validRequest.setPassword("password123");
        validRequest.setDisplayName("Test User");
        validRequest.setRole(UserRole.USER);
    }

    @Test
    void register_withNewEmail_createsUserAndReturnsToken() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .passwordHash("hashed")
                .role(UserRole.USER)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(profileService.createProfile(any(), eq("Test User"))).thenReturn(null);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("jwt-token");

        AuthResponse response = authService.register(validRequest);

        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getRole()).isEqualTo("USER");
        verify(userRepository).save(any(User.class));
        verify(profileService).createProfile(any(), eq("Test User"));
    }

    @Test
    void register_withExistingEmail_throwsConflictException() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_normalizesEmailToLowercase() {
        validRequest.setEmail("Test@Example.COM");
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .passwordHash("hashed")
                .role(UserRole.USER)
                .build();
        when(userRepository.save(any())).thenReturn(savedUser);
        when(profileService.createProfile(any(), any())).thenReturn(null);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("token");

        authService.register(validRequest);

        verify(userRepository).existsByEmail("test@example.com");
    }

    @Test
    void register_withCoachRole_setsRoleCorrectly() {
        validRequest.setRole(UserRole.COACH);
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .passwordHash("hashed")
                .role(UserRole.COACH)
                .build();
        when(userRepository.save(any())).thenReturn(savedUser);
        when(profileService.createProfile(any(), any())).thenReturn(null);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("token");

        AuthResponse response = authService.register(validRequest);

        assertThat(response.getRole()).isEqualTo("COACH");
    }
}
