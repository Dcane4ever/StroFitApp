package com.strofit.backend.diary.dto;

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
public class UpdateDiaryItemRequest {

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
    @DecimalMax(value = "99999.999", message = "Quantity is too large")
    private BigDecimal quantity;

    private UUID servingUnitId;

    @Size(max = 50, message = "Unit label must be under 50 characters")
    private String servingUnitLabel;

    @DecimalMin(value = "0.001", message = "Grams per unit must be greater than 0")
    private BigDecimal gramsPerUnit;

    @Size(max = 500, message = "Notes must be under 500 characters")
    private String notes;
}
