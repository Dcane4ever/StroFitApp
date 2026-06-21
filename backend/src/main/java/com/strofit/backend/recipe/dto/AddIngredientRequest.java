package com.strofit.backend.recipe.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class AddIngredientRequest {

    @NotNull(message = "food_item_id is required")
    private UUID foodItemId;

    private UUID brandedProductId;

    @NotNull(message = "quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
    @DecimalMax(value = "99999.999", message = "Quantity is too large")
    private BigDecimal quantity;

    @NotNull(message = "serving_unit_id is required")
    private UUID servingUnitId;

    @Min(value = 0, message = "ingredient_order must be non-negative")
    private Integer ingredientOrder;

    @Size(max = 500, message = "ingredient_note must be under 500 characters")
    private String ingredientNote;
}
