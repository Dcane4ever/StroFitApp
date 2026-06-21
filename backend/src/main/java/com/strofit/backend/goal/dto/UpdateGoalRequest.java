package com.strofit.backend.goal.dto;

import com.strofit.backend.goal.GoalType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class UpdateGoalRequest {

    @NotNull(message = "Goal type is required")
    private GoalType goalType;

    @NotNull(message = "Calorie target is required")
    @Min(value = 500, message = "Calorie target must be at least 500 kcal")
    @Max(value = 10000, message = "Calorie target must be at most 10000 kcal")
    private Integer calorieTarget;

    @NotNull(message = "Protein target is required")
    @DecimalMin(value = "0.0", message = "Protein target must be non-negative")
    @DecimalMax(value = "500.0", message = "Protein target must be at most 500g")
    private BigDecimal proteinTargetG;

    @NotNull(message = "Carbs target is required")
    @DecimalMin(value = "0.0", message = "Carbs target must be non-negative")
    @DecimalMax(value = "1000.0", message = "Carbs target must be at most 1000g")
    private BigDecimal carbsTargetG;

    @NotNull(message = "Fats target is required")
    @DecimalMin(value = "0.0", message = "Fats target must be non-negative")
    @DecimalMax(value = "500.0", message = "Fats target must be at most 500g")
    private BigDecimal fatsTargetG;

    @DecimalMin(value = "0.0", message = "Fiber target must be non-negative")
    @DecimalMax(value = "200.0", message = "Fiber target must be at most 200g")
    private BigDecimal fiberTargetG;

    @DecimalMin(value = "0.0", message = "Daily budget must be non-negative")
    @DecimalMax(value = "100000.0", message = "Daily budget seems too high")
    private BigDecimal dailyBudgetPhp;
}
