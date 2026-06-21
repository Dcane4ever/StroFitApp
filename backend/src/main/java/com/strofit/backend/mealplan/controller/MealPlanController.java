package com.strofit.backend.mealplan.controller;

import com.strofit.backend.common.dto.ApiResponse;
import com.strofit.backend.mealplan.dto.*;
import com.strofit.backend.mealplan.service.MealPlanService;
import com.strofit.backend.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/meal-plans")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ApiResponse<MealPlanResponse>> create(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateMealPlanRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(mealPlanService.createMealPlan(userId, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<MealPlanResponse>> get(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(mealPlanService.getMealPlan(userId, date)));
    }

    @PutMapping("/{planId}")
    public ResponseEntity<ApiResponse<MealPlanResponse>> update(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID planId,
            @Valid @RequestBody UpdateMealPlanRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(mealPlanService.updateMealPlan(userId, planId, request)));
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> delete(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID planId) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        mealPlanService.deleteMealPlan(userId, planId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{planId}/items")
    public ResponseEntity<ApiResponse<MealPlanItemResponse>> addItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID planId,
            @Valid @RequestBody AddMealPlanItemRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(mealPlanService.addItem(userId, planId, request)));
    }

    @DeleteMapping("/{planId}/items/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID planId,
            @PathVariable UUID itemId) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        mealPlanService.deleteItem(userId, planId, itemId);
        return ResponseEntity.noContent().build();
    }
}
