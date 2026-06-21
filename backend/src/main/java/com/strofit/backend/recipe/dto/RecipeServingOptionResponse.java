package com.strofit.backend.recipe.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.recipe.entity.RecipeServingOption;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecipeServingOptionResponse {

    private UUID id;
    private String label;
    private BigDecimal quantity;
    private BigDecimal gramsEquivalent;
    private BigDecimal fractionOfRecipe;
    private boolean defaultOption;
    private Integer displayOrder;

    // Computed nutrition for this serving option
    private RecipeNutritionTotals nutritionPerServing;

    public static RecipeServingOptionResponse from(RecipeServingOption option,
                                                   RecipeNutritionTotals nutritionPerServing) {
        return RecipeServingOptionResponse.builder()
                .id(option.getId())
                .label(option.getLabel())
                .quantity(option.getQuantity())
                .gramsEquivalent(option.getGramsEquivalent())
                .fractionOfRecipe(option.getFractionOfRecipe())
                .defaultOption(option.isDefaultOption())
                .displayOrder(option.getDisplayOrder())
                .nutritionPerServing(nutritionPerServing)
                .build();
    }
}
