package com.strofit.backend.food.dto;

import com.strofit.backend.food.entity.FoodServingUnit;
import com.strofit.backend.food.enums.ServingUnitType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class FoodServingUnitResponse {

    private UUID id;
    private ServingUnitType unitType;
    private String unitLabel;
    private BigDecimal gramsPerUnit;
    private boolean defaultUnit;
    private int sortOrder;

    public static FoodServingUnitResponse from(FoodServingUnit u) {
        return FoodServingUnitResponse.builder()
                .id(u.getId())
                .unitType(u.getUnitType())
                .unitLabel(u.getUnitLabel())
                .gramsPerUnit(u.getGramsPerUnit())
                .defaultUnit(u.isDefaultUnit())
                .sortOrder(u.getSortOrder())
                .build();
    }
}
