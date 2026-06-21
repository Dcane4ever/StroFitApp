package com.strofit.backend.food.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.food.entity.FoodNutrition;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FoodNutritionResponse {

    private BigDecimal caloriesPer100g;
    private BigDecimal proteinPer100g;
    private BigDecimal carbsPer100g;
    private BigDecimal fatPer100g;
    private BigDecimal fiberPer100g;
    private BigDecimal sugarPer100g;
    private BigDecimal sodiumPer100mg;

    // Source serving reference shown on detail screens
    private BigDecimal perQuantity;
    private String perUnitLabel;

    public static FoodNutritionResponse from(FoodNutrition n) {
        return FoodNutritionResponse.builder()
                .caloriesPer100g(n.getCaloriesPer100g())
                .proteinPer100g(n.getProteinPer100g())
                .carbsPer100g(n.getCarbsPer100g())
                .fatPer100g(n.getFatPer100g())
                .fiberPer100g(n.getFiberPer100g())
                .sugarPer100g(n.getSugarPer100g())
                .sodiumPer100mg(n.getSodiumPer100mg())
                .perQuantity(n.getPerQuantity())
                .perUnitLabel(n.getPerUnitLabel())
                .build();
    }
}
