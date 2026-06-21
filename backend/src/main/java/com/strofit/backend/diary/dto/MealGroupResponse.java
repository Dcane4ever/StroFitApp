package com.strofit.backend.diary.dto;

import com.strofit.backend.diary.enums.MealType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class MealGroupResponse {

    private MealType mealType;
    private List<DiaryItemResponse> items;

    private BigDecimal totalCalories;
    private BigDecimal totalProteinG;
    private BigDecimal totalCarbsG;
    private BigDecimal totalFatG;
    private BigDecimal totalFiberG;
    private BigDecimal totalPriceAmount;
}
