package com.strofit.backend.recipe.controller;

import com.strofit.backend.common.dto.ApiResponse;
import com.strofit.backend.recipe.dto.*;
import com.strofit.backend.recipe.service.RecipeService;
import com.strofit.backend.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final JwtService jwtService;

    // -------------------------------------------------------------------------
    // Recipe CRUD
    // -------------------------------------------------------------------------

    @PostMapping
    public ResponseEntity<ApiResponse<RecipeDetailResponse>> createRecipe(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateRecipeRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(recipeService.createRecipe(userId, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecipeSummaryResponse>>> listRecipes(
            @RequestHeader("Authorization") String authHeader) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(recipeService.listRecipes(userId)));
    }

    @GetMapping("/{recipeId}")
    public ResponseEntity<ApiResponse<RecipeDetailResponse>> getRecipe(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID recipeId) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(recipeService.getRecipe(userId, recipeId)));
    }

    @PutMapping("/{recipeId}")
    public ResponseEntity<ApiResponse<RecipeDetailResponse>> updateRecipe(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID recipeId,
            @Valid @RequestBody UpdateRecipeRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(recipeService.updateRecipe(userId, recipeId, request)));
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Void> deleteRecipe(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID recipeId) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        recipeService.deleteRecipe(userId, recipeId);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Ingredients
    // -------------------------------------------------------------------------

    @PostMapping("/{recipeId}/ingredients")
    public ResponseEntity<ApiResponse<RecipeIngredientResponse>> addIngredient(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID recipeId,
            @Valid @RequestBody AddIngredientRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(recipeService.addIngredient(userId, recipeId, request)));
    }

    @PutMapping("/{recipeId}/ingredients/{ingredientId}")
    public ResponseEntity<ApiResponse<RecipeIngredientResponse>> updateIngredient(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID recipeId,
            @PathVariable UUID ingredientId,
            @Valid @RequestBody UpdateIngredientRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(
                recipeService.updateIngredient(userId, recipeId, ingredientId, request)));
    }

    @DeleteMapping("/{recipeId}/ingredients/{ingredientId}")
    public ResponseEntity<Void> deleteIngredient(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID recipeId,
            @PathVariable UUID ingredientId) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        recipeService.deleteIngredient(userId, recipeId, ingredientId);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Serving options
    // -------------------------------------------------------------------------

    @PostMapping("/{recipeId}/servings")
    public ResponseEntity<ApiResponse<RecipeServingOptionResponse>> addServingOption(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID recipeId,
            @Valid @RequestBody AddServingOptionRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(recipeService.addServingOption(userId, recipeId, request)));
    }

    @PutMapping("/{recipeId}/servings/{servingId}")
    public ResponseEntity<ApiResponse<RecipeServingOptionResponse>> updateServingOption(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID recipeId,
            @PathVariable UUID servingId,
            @Valid @RequestBody UpdateServingOptionRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(
                recipeService.updateServingOption(userId, recipeId, servingId, request)));
    }

    @DeleteMapping("/{recipeId}/servings/{servingId}")
    public ResponseEntity<Void> deleteServingOption(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID recipeId,
            @PathVariable UUID servingId) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        recipeService.deleteServingOption(userId, recipeId, servingId);
        return ResponseEntity.noContent().build();
    }
}
