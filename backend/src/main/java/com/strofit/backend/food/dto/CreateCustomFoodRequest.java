package com.strofit.backend.food.dto;

import com.strofit.backend.food.enums.ServingUnitType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class CreateCustomFoodRequest {

    @NotBlank(message = "Food name is required")
    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;

    @Size(max = 1000, message = "Description must be under 1000 characters")
    private String description;

    @Size(max = 100, message = "Category must be under 100 characters")
    private String category;

    // Nutrition per 100g — calories required, macros optional
    @NotNull(message = "Calories per 100g is required")
    @DecimalMin(value = "0.0", message = "Calories must be non-negative")
    @DecimalMax(value = "9000.0", message = "Calories per 100g cannot exceed 9000 kcal")
    private BigDecimal caloriesPer100g;

    @DecimalMin(value = "0.0", message = "Protein must be non-negative")
    @DecimalMax(value = "100.0", message = "Protein per 100g cannot exceed 100g")
    private BigDecimal proteinPer100g;

    @DecimalMin(value = "0.0", message = "Carbs must be non-negative")
    @DecimalMax(value = "100.0", message = "Carbs per 100g cannot exceed 100g")
    private BigDecimal carbsPer100g;

    @DecimalMin(value = "0.0", message = "Fat must be non-negative")
    @DecimalMax(value = "100.0", message = "Fat per 100g cannot exceed 100g")
    private BigDecimal fatPer100g;

    @DecimalMin(value = "0.0", message = "Fiber must be non-negative")
    @DecimalMax(value = "100.0", message = "Fiber per 100g cannot exceed 100g")
    private BigDecimal fiberPer100g;

    // Default serving unit — optional but recommended
    private ServingUnitType defaultUnitType;

    @Size(max = 50, message = "Unit label must be under 50 characters")
    private String defaultUnitLabel;

    @DecimalMin(value = "0.001", message = "Grams per unit must be greater than 0")
    private BigDecimal defaultUnitGramsPerUnit;
}
