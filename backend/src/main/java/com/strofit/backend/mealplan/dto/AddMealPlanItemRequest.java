package com.strofit.backend.mealplan.dto;

import com.strofit.backend.diary.enums.MealType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class AddMealPlanItemRequest {

    @NotNull(message = "meal_type is required")
    private MealType mealType;

    // Exactly one of food_item_id or recipe_id must be provided (validated in service)
    private UUID foodItemId;
    private UUID recipeId;

    @NotNull(message = "quantity is required")
    @DecimalMin(value = "0.001", message = "quantity must be greater than 0")
    private BigDecimal quantity;

    // For food items — resolved from food's default unit if omitted
    private UUID servingUnitId;

    @Size(max = 50, message = "serving_unit_label must be under 50 characters")
    private String servingUnitLabel;

    @Min(value = 0, message = "sort_order must be non-negative")
    private Integer sortOrder;
}
