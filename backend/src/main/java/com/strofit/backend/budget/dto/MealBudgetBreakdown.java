package com.strofit.backend.budget.dto;

import com.strofit.backend.diary.enums.MealType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class MealBudgetBreakdown {

    private MealType mealType;
    private BigDecimal totalSpent;
    private int itemCount;
}
