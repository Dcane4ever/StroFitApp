package com.strofit.backend.mealplan.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CreateMealPlanRequest {

    @NotNull(message = "plan_date is required")
    private LocalDate planDate;

    // Snapshots from active goal — if null, service reads them from the user's active goal
    @DecimalMin(value = "0", message = "target_calories must be non-negative")
    private BigDecimal targetCalories;

    @DecimalMin(value = "0", message = "target_protein_g must be non-negative")
    private BigDecimal targetProteinG;

    @DecimalMin(value = "0", message = "target_carbs_g must be non-negative")
    private BigDecimal targetCarbsG;

    @DecimalMin(value = "0", message = "target_fat_g must be non-negative")
    private BigDecimal targetFatG;

    @DecimalMin(value = "0", message = "budget_limit_php must be non-negative")
    private BigDecimal budgetLimitPhp;

    @Size(max = 1000, message = "notes must be under 1000 characters")
    private String notes;
}
