package com.strofit.backend.diary.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DiaryDayResponse {

    private UUID diaryEntryId;
    private LocalDate date;

    private List<MealGroupResponse> meals;

    // Day totals
    private BigDecimal totalCalories;
    private BigDecimal totalProteinG;
    private BigDecimal totalCarbsG;
    private BigDecimal totalFatG;
    private BigDecimal totalFiberG;
    private BigDecimal totalPriceAmount;

    private int totalItems;
}
