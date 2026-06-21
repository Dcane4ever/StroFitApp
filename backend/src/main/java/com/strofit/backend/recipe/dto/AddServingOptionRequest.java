package com.strofit.backend.recipe.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class AddServingOptionRequest {

    @NotBlank(message = "label is required")
    @Size(max = 100, message = "label must be under 100 characters")
    private String label;

    @NotNull(message = "quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    // If the serving can be expressed in grams, set this so cross-serving nutrition works
    @DecimalMin(value = "0.01", message = "grams_equivalent must be greater than 0")
    private BigDecimal gramsEquivalent;

    // Direct fraction of the whole recipe (0 < value <= 1). If omitted and totalServings is set,
    // service computes it as quantity / totalServings (caller provides quantity = 1, meaning "1 serving").
    @DecimalMin(value = "0.000001", inclusive = true, message = "fraction_of_recipe must be positive")
    @DecimalMax(value = "1.0", message = "fraction_of_recipe cannot exceed 1")
    private BigDecimal fractionOfRecipe;

    private boolean defaultOption;

    @Min(value = 0, message = "display_order must be non-negative")
    private Integer displayOrder;
}
