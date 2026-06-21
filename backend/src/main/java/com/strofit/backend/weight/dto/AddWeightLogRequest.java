package com.strofit.backend.weight.dto;

import com.strofit.backend.weight.enums.WeightUnit;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class AddWeightLogRequest {

    @NotNull(message = "logged_at is required")
    private Instant loggedAt;

    @NotNull(message = "weight_value is required")
    @DecimalMin(value = "0.01", message = "Weight must be greater than 0")
    @DecimalMax(value = "999.99", message = "Weight value is unrealistically large")
    private BigDecimal weightValue;

    private WeightUnit weightUnit = WeightUnit.KG;

    @DecimalMin(value = "0.0", inclusive = true, message = "Body fat percentage must be non-negative")
    @DecimalMax(value = "100.0", message = "Body fat percentage cannot exceed 100")
    private BigDecimal bodyFatPercentage;

    @DecimalMin(value = "0.01", message = "Waist measurement must be greater than 0")
    private BigDecimal waistCm;

    @Size(max = 500, message = "Note must be under 500 characters")
    private String note;
}
