package com.strofit.backend.mealplan.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MealPlanResponse {

    private UUID id;
    private LocalDate planDate;
    private BigDecimal targetCalories;
    private BigDecimal targetProteinG;
    private BigDecimal targetCarbsG;
    private BigDecimal targetFatG;
    private BigDecimal budgetLimitPhp;
    private String notes;

    private List<MealPlanMealGroupResponse> meals;

    // Day totals
    private BigDecimal totalPlannedCalories;
    private BigDecimal totalPlannedProteinG;
    private BigDecimal totalPlannedCarbsG;
    private BigDecimal totalPlannedFatG;
    private BigDecimal totalEstimatedCostPhp;

    private Instant createdAt;
    private Instant updatedAt;
}
