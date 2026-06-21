package com.strofit.backend.coaching.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TraineeSummaryResponse {

    // Identity
    private UUID traineeUserId;
    private String displayName;
    private String email;

    // Weight
    private BigDecimal latestWeightKg;
    private String latestWeightUnit;
    private Instant latestWeightLoggedAt;
    private BigDecimal weightChange7d;
    private BigDecimal weightChange30d;

    // Nutrition averages (30-day lookback)
    private BigDecimal avgCaloriesPerDay;
    private BigDecimal avgProteinGPerDay;
    private BigDecimal avgCarbsGPerDay;
    private BigDecimal avgFatGPerDay;
    private int loggedDaysLast30;

    // Budget (30-day lookback)
    private BigDecimal avgDailyBudgetLimit;
    private BigDecimal avgDailySpend;
    private BigDecimal avgBudgetUsagePercent;

    // Activity
    private LocalDate lastLoggedDate;
    private int currentStreak;
}
