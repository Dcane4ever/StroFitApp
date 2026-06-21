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
public class WeeklyBudgetSummaryResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private int totalDays;

    private BigDecimal totalBudgetLimit;
    private BigDecimal totalSpent;
    private BigDecimal totalRemaining;
    private BigDecimal averageDailySpend;
    private BigDecimal averageDailyBudget;

    private List<DailyBudgetSummaryResponse> dailySummaries;
}
