package com.strofit.backend.recipe.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CreateRecipeRequest {

    @NotBlank(message = "Recipe name is required")
    @Size(max = 255, message = "Name must be under 255 characters")
    private String name;

    @Size(max = 2000, message = "Description must be under 2000 characters")
    private String description;

    @Size(max = 2000, message = "Notes must be under 2000 characters")
    private String notes;

    @DecimalMin(value = "0.01", message = "Total servings must be greater than 0")
    private BigDecimal totalServings;

    @Size(max = 100, message = "Default serving label must be under 100 characters")
    private String defaultServingLabel;

    @Valid
    private List<AddIngredientRequest> ingredients;

    @Valid
    private List<AddServingOptionRequest> servingOptions;
}
