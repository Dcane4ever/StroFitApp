package com.strofit.backend.mealplan.dto;

import com.strofit.backend.diary.enums.MealType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class MealPlanMealGroupResponse {

    private MealType mealType;
    private List<MealPlanItemResponse> items;

    private BigDecimal totalPlannedCalories;
    private BigDecimal totalPlannedProteinG;
    private BigDecimal totalPlannedCarbsG;
    private BigDecimal totalPlannedFatG;
    private BigDecimal totalEstimatedCostPhp;
}
