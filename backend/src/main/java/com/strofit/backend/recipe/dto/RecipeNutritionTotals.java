package com.strofit.backend.recipe.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecipeNutritionTotals {

    private BigDecimal calories;
    private BigDecimal proteinG;
    private BigDecimal carbsG;
    private BigDecimal fatG;
    private BigDecimal fiberG;

    public static RecipeNutritionTotals zero() {
        return RecipeNutritionTotals.builder()
                .calories(BigDecimal.ZERO)
                .proteinG(BigDecimal.ZERO)
                .carbsG(BigDecimal.ZERO)
                .fatG(BigDecimal.ZERO)
                .fiberG(BigDecimal.ZERO)
                .build();
    }
}
