package com.strofit.backend.recipe.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecipeDetailResponse {

    private UUID id;
    private UUID userId;
    private String name;
    private String description;
    private String notes;
    private BigDecimal totalServings;
    private String defaultServingLabel;

    private List<RecipeIngredientResponse> ingredients;
    private List<RecipeServingOptionResponse> servingOptions;

    // Full recipe nutrition (sum of all ingredients)
    private RecipeNutritionTotals totalNutrition;

    // Nutrition for 1 default serving = totalNutrition / totalServings
    private RecipeNutritionTotals nutritionPerDefaultServing;

    // Estimated cost
    private BigDecimal estimatedTotalCostPhp;
    private BigDecimal estimatedCostPerServingPhp;

    private Instant createdAt;
    private Instant updatedAt;
}
