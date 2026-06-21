package com.strofit.backend.weight.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.weight.enums.WeightUnit;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WeightProgressSummaryResponse {

    // Current (most recent log overall, not range-bounded)
    private BigDecimal currentWeight;
    private WeightUnit currentWeightUnit;
    private Instant latestLoggedAt;

    // Range stats
    private BigDecimal firstWeightInRange;
    private BigDecimal lastWeightInRange;
    private BigDecimal weightChange;         // lastWeightInRange - firstWeightInRange
    private BigDecimal averageWeightInRange;
    private long totalLogsInRange;
}
