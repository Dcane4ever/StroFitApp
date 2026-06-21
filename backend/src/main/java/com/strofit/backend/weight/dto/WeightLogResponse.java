package com.strofit.backend.weight.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.weight.entity.WeightLog;
import com.strofit.backend.weight.enums.WeightUnit;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WeightLogResponse {

    private UUID id;
    private Instant loggedAt;
    private BigDecimal weightValue;
    private WeightUnit weightUnit;
    private BigDecimal bodyFatPercentage;
    private BigDecimal waistCm;
    private String note;
    private Instant createdAt;

    public static WeightLogResponse from(WeightLog log) {
        return WeightLogResponse.builder()
                .id(log.getId())
                .loggedAt(log.getLoggedAt())
                .weightValue(log.getWeightValue())
                .weightUnit(log.getWeightUnit())
                .bodyFatPercentage(log.getBodyFatPercentage())
                .waistCm(log.getWaistCm())
                .note(log.getNote())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
