package com.strofit.backend.weight.controller;

import com.strofit.backend.common.dto.ApiResponse;
import com.strofit.backend.security.JwtService;
import com.strofit.backend.weight.dto.*;
import com.strofit.backend.weight.service.WeightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/weights")
@RequiredArgsConstructor
public class WeightController {

    private final WeightService weightService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ApiResponse<WeightLogResponse>> addLog(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody AddWeightLogRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(weightService.addLog(userId, request)));
    }

    @PutMapping("/{logId}")
    public ResponseEntity<ApiResponse<WeightLogResponse>> updateLog(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID logId,
            @Valid @RequestBody UpdateWeightLogRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(weightService.updateLog(userId, logId, request)));
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<Void> deleteLog(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID logId) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        weightService.deleteLog(userId, logId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WeightLogResponse>>> getLogs(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(weightService.getLogs(userId, start, end)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<WeightProgressSummaryResponse>> getSummary(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(weightService.getSummary(userId, start, end)));
    }
}
