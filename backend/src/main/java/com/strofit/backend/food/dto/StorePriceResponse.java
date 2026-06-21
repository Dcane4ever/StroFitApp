package com.strofit.backend.food.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.food.entity.StorePrice;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StorePriceResponse {

    private UUID id;
    private String storeName;
    private BigDecimal pricePHP;
    private BigDecimal quantityG;
    private String quantityLabel;
    private OffsetDateTime observedAt;

    public static StorePriceResponse from(StorePrice p) {
        return StorePriceResponse.builder()
                .id(p.getId())
                .storeName(p.getStoreName())
                .pricePHP(p.getPricePHP())
                .quantityG(p.getQuantityG())
                .quantityLabel(p.getQuantityLabel())
                .observedAt(p.getObservedAt())
                .build();
    }
}
