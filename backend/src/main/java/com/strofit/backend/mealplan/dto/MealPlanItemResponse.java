package com.strofit.backend.mealplan.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.diary.enums.MealType;
import com.strofit.backend.mealplan.entity.MealPlanItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MealPlanItemResponse {

    private UUID id;
    private MealType mealType;
    private UUID foodItemId;
    private UUID recipeId;
    private String itemNameSnapshot;
    private BigDecimal quantity;
    private UUID servingUnitId;
    private String servingUnitLabel;
    private BigDecimal plannedCalories;
    private BigDecimal plannedProteinG;
    private BigDecimal plannedCarbsG;
    private BigDecimal plannedFatG;
    private BigDecimal plannedFiberG;
    private BigDecimal estimatedCostPhp;
    private Integer sortOrder;

    public static MealPlanItemResponse from(MealPlanItem item) {
        return MealPlanItemResponse.builder()
                .id(item.getId())
                .mealType(item.getMealType())
                .foodItemId(item.getFoodItemId())
                .recipeId(item.getRecipeId())
                .itemNameSnapshot(item.getItemNameSnapshot())
                .quantity(item.getQuantity())
                .servingUnitId(item.getServingUnitId())
                .servingUnitLabel(item.getServingUnitLabel())
                .plannedCalories(item.getPlannedCalories())
                .plannedProteinG(item.getPlannedProteinG())
                .plannedCarbsG(item.getPlannedCarbsG())
                .plannedFatG(item.getPlannedFatG())
                .plannedFiberG(item.getPlannedFiberG())
                .estimatedCostPhp(item.getEstimatedCostPhp())
                .sortOrder(item.getSortOrder())
                .build();
    }
}
