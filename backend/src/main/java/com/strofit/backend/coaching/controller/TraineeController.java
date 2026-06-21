package com.strofit.backend.coaching.controller;

import com.strofit.backend.coaching.dto.*;
import com.strofit.backend.coaching.service.CoachService;
import com.strofit.backend.common.dto.ApiResponse;
import com.strofit.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/trainee")
@RequiredArgsConstructor
public class TraineeController {

    private final CoachService coachService;
    private final JwtService jwtService;

    @GetMapping("/coach")
    public ResponseEntity<ApiResponse<List<TraineeCoachResponse>>> getMyCoach(
            @RequestHeader("Authorization") String authHeader) {
        UUID traineeId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(coachService.getMyCoach(traineeId)));
    }

    @PostMapping("/invite/{inviteId}/accept")
    public ResponseEntity<ApiResponse<TraineeCoachResponse>> acceptInvite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID inviteId) {
        UUID traineeId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(coachService.acceptInvite(traineeId, inviteId)));
    }

    @PostMapping("/invite/{inviteId}/reject")
    public ResponseEntity<Void> rejectInvite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID inviteId) {
        UUID traineeId = jwtService.extractUserId(authHeader.substring(7));
        coachService.rejectInvite(traineeId, inviteId);
        return ResponseEntity.noContent().build();
    }
}
