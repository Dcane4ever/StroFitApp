package com.strofit.backend.goal;

import com.strofit.backend.common.dto.ApiResponse;
import com.strofit.backend.goal.dto.UpdateGoalRequest;
import com.strofit.backend.goal.dto.UserGoalResponse;
import com.strofit.backend.security.JwtService;
import com.strofit.backend.user.User;
import com.strofit.backend.user.UserRepository;
import com.strofit.backend.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
public class UserGoalController {

    private final UserGoalService goalService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserGoalResponse>> getMyGoal(
            @RequestHeader("Authorization") String authHeader) {
        UUID userId = extractUserId(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(goalService.getActiveGoal(userId)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserGoalResponse>> updateMyGoal(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdateGoalRequest request) {
        UUID userId = extractUserId(authHeader);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));
        return ResponseEntity.ok(ApiResponse.ok(goalService.upsertGoal(userId, request, user)));
    }

    private UUID extractUserId(String authHeader) {
        return jwtService.extractUserId(authHeader.substring(7));
    }
}
