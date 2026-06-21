package com.strofit.backend.coaching.controller;

import com.strofit.backend.coaching.dto.*;
import com.strofit.backend.coaching.service.CoachService;
import com.strofit.backend.common.dto.ApiResponse;
import com.strofit.backend.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/coach")
@RequiredArgsConstructor
public class CoachController {

    private final CoachService coachService;
    private final JwtService jwtService;

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<CoachTraineeLinkResponse>> invite(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody InviteTraineeRequest request) {
        UUID coachId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(coachService.invite(coachId, request)));
    }

    @GetMapping("/trainees")
    public ResponseEntity<ApiResponse<List<CoachTraineeLinkResponse>>> getTrainees(
            @RequestHeader("Authorization") String authHeader) {
        UUID coachId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(coachService.getTrainees(coachId)));
    }

    @GetMapping("/trainees/{traineeId}/summary")
    public ResponseEntity<ApiResponse<TraineeSummaryResponse>> getTraineeSummary(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID traineeId) {
        UUID coachId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(coachService.getTraineeSummary(coachId, traineeId)));
    }

    @DeleteMapping("/trainees/{traineeId}")
    public ResponseEntity<Void> removeTrainee(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID traineeId) {
        UUID coachId = jwtService.extractUserId(authHeader.substring(7));
        coachService.removeTrainee(coachId, traineeId);
        return ResponseEntity.noContent().build();
    }
}
