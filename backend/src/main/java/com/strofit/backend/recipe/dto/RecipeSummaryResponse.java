package com.strofit.backend.recipe.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.recipe.entity.Recipe;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecipeSummaryResponse {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal totalServings;
    private String defaultServingLabel;
    private int totalIngredients;

    // Computed summary fields — calorie totals for quick display
    private BigDecimal totalCalories;
    private BigDecimal caloriesPerDefaultServing;

    private Instant updatedAt;

    public static RecipeSummaryResponse from(Recipe recipe,
                                             int totalIngredients,
                                             BigDecimal totalCalories,
                                             BigDecimal caloriesPerDefaultServing) {
        return RecipeSummaryResponse.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .description(recipe.getDescription())
                .totalServings(recipe.getTotalServings())
                .defaultServingLabel(recipe.getDefaultServingLabel())
                .totalIngredients(totalIngredients)
                .totalCalories(totalCalories)
                .caloriesPerDefaultServing(caloriesPerDefaultServing)
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }
}
