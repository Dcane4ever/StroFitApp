package com.strofit.backend.food.controller;

import com.strofit.backend.common.dto.ApiResponse;
import com.strofit.backend.food.dto.*;
import com.strofit.backend.food.service.FoodService;
import com.strofit.backend.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;
    private final JwtService jwtService;

    /**
     * GET /foods/search?q=adobo&page=0&pageSize=20
     * Full-text search across food names and aliases.
     * Returns lightweight list items (no serving units or prices).
     */
    @GetMapping("/foods/search")
    public ResponseEntity<ApiResponse<FoodSearchResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(ApiResponse.ok(foodService.search(q, page, pageSize)));
    }

    /**
     * GET /foods/{id}
     * Full detail: nutrition, serving units, prices.
     */
    @GetMapping("/foods/{id}")
    public ResponseEntity<ApiResponse<FoodItemResponse>> getById(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(foodService.getById(id)));
    }

    /**
     * POST /foods/custom
     * Create a user-owned custom food. Private by default.
     */
    @PostMapping("/foods/custom")
    public ResponseEntity<ApiResponse<FoodItemResponse>> createCustomFood(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateCustomFoodRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        FoodItemResponse response = foodService.createCustomFood(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    /**
     * GET /barcodes/{barcode}
     * Look up a product by barcode value.
     * Returns 404 if not in the local DB — barcode enrichment pipeline is a later milestone.
     */
    @GetMapping("/barcodes/{barcode}")
    public ResponseEntity<ApiResponse<BarcodeProductResponse>> getByBarcode(
            @PathVariable String barcode) {
        return ResponseEntity.ok(ApiResponse.ok(foodService.getByBarcode(barcode)));
    }
}
