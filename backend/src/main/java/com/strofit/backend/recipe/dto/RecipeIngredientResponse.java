package com.strofit.backend.recipe.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.recipe.entity.RecipeIngredient;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecipeIngredientResponse {

    private UUID id;
    private UUID foodItemId;
    private UUID brandedProductId;
    private String foodNameSnapshot;
    private String brandNameSnapshot;
    private BigDecimal quantity;
    private UUID servingUnitId;
    private String servingUnitLabel;
    private BigDecimal gramsPerUnit;
    private BigDecimal totalGrams;
    private Integer ingredientOrder;
    private String ingredientNote;

    // Per-ingredient computed nutrition
    private RecipeNutritionTotals nutrition;

    public static RecipeIngredientResponse from(RecipeIngredient ingredient,
                                                String servingUnitLabel,
                                                BigDecimal gramsPerUnit,
                                                BigDecimal totalGrams,
                                                RecipeNutritionTotals nutrition) {
        return RecipeIngredientResponse.builder()
                .id(ingredient.getId())
                .foodItemId(ingredient.getFoodItemId())
                .brandedProductId(ingredient.getBrandedProductId())
                .foodNameSnapshot(ingredient.getFoodNameSnapshot())
                .brandNameSnapshot(ingredient.getBrandNameSnapshot())
                .quantity(ingredient.getQuantity())
                .servingUnitId(ingredient.getServingUnitId())
                .servingUnitLabel(servingUnitLabel)
                .gramsPerUnit(gramsPerUnit)
                .totalGrams(totalGrams)
                .ingredientOrder(ingredient.getIngredientOrder())
                .ingredientNote(ingredient.getIngredientNote())
                .nutrition(nutrition)
                .build();
    }
}
