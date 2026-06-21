package com.strofit.backend.auth;

import com.strofit.backend.auth.dto.AuthResponse;
import com.strofit.backend.auth.dto.LoginRequest;
import com.strofit.backend.auth.dto.RegisterRequest;
import com.strofit.backend.common.exception.ConflictException;
import com.strofit.backend.common.exception.ResourceNotFoundException;
import com.strofit.backend.profile.UserProfile;
import com.strofit.backend.profile.UserProfileService;
import com.strofit.backend.security.JwtService;
import com.strofit.backend.user.User;
import com.strofit.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileService profileService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        user = userRepository.save(user);

        // Create a blank profile so GET /profile/me works immediately after registration
        profileService.createProfile(user, request.getDisplayName());

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        log.info("New user registered: {} [{}]", user.getEmail(), user.getRole());

        return AuthResponse.of(token, user, request.getDisplayName());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // This throws BadCredentialsException if invalid — handled by GlobalExceptionHandler
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User"));

        String displayName = profileService.getProfile(user.getId()).getDisplayName();
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.of(token, user, displayName);
    }

    @Transactional(readOnly = true)
    public AuthResponse getMe(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));

        String displayName = profileService.getProfile(userId).getDisplayName();
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.of(token, user, displayName);
    }
}
