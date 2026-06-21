package com.strofit.backend.budget.controller;

import com.strofit.backend.budget.dto.DailyBudgetSummaryResponse;
import com.strofit.backend.budget.dto.WeeklyBudgetSummaryResponse;
import com.strofit.backend.budget.service.BudgetService;
import com.strofit.backend.common.dto.ApiResponse;
import com.strofit.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final JwtService jwtService;

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DailyBudgetSummaryResponse>> getDaily(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(budgetService.getDailyBudget(userId, date)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DailyBudgetSummaryResponse>> getSummary(
            @RequestHeader("Authorization") String authHeader) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(budgetService.getDailyBudget(userId, LocalDate.now())));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<WeeklyBudgetSummaryResponse>> getRange(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(budgetService.getRangeBudget(userId, start, end)));
    }
}
