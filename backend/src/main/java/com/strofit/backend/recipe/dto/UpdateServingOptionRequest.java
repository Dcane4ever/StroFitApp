package com.strofit.backend.recipe.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class UpdateServingOptionRequest {

    @NotBlank(message = "label is required")
    @Size(max = 100, message = "label must be under 100 characters")
    private String label;

    @NotNull(message = "quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @DecimalMin(value = "0.01", message = "grams_equivalent must be greater than 0")
    private BigDecimal gramsEquivalent;

    @DecimalMin(value = "0.000001", inclusive = true, message = "fraction_of_recipe must be positive")
    @DecimalMax(value = "1.0", message = "fraction_of_recipe cannot exceed 1")
    private BigDecimal fractionOfRecipe;

    private boolean defaultOption;

    @Min(value = 0, message = "display_order must be non-negative")
    private Integer displayOrder;
}
