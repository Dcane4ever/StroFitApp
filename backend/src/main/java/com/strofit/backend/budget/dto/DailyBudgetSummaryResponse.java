package com.strofit.backend.budget.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DailyBudgetSummaryResponse {

    private LocalDate date;
    private BigDecimal budgetLimit;
    private BigDecimal totalSpent;
    private BigDecimal remainingBudget;
    private BigDecimal percentageUsed;
    private int totalItemsLogged;

    // Meal-type breakdown
    private List<MealBudgetBreakdown> mealBreakdown;
}
