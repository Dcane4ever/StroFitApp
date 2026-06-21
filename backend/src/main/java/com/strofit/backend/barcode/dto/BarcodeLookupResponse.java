package com.strofit.backend.barcode.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.food.dto.FoodItemResponse;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BarcodeLookupResponse {

    public enum LookupStatus {
        FOUND_LOCAL,
        FOUND_ENRICHED,
        NOT_FOUND
    }

    private String barcodeValue;
    private LookupStatus status;
    private boolean foundLocally;
    private boolean enrichedExternally;
    private String message;

    // Populated when status != NOT_FOUND
    private UUID productId;
    private String productName;
    private String brandName;
    private String imageUrl;
    private BigDecimal netWeightG;
    private BigDecimal servingSizeG;
    private String servingSizeLabel;
    private String sourceName;

    // Full food detail embedded (nutrition + serving units)
    private FoodItemResponse foodItem;

    // Convenience factory for NOT_FOUND
    public static BarcodeLookupResponse notFound(String barcodeValue) {
        return BarcodeLookupResponse.builder()
                .barcodeValue(barcodeValue)
                .status(LookupStatus.NOT_FOUND)
                .foundLocally(false)
                .enrichedExternally(false)
                .message("Barcode not found in local database or external sources.")
                .build();
    }
}
