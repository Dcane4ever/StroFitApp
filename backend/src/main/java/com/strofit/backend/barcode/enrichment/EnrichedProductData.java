package com.strofit.backend.barcode.enrichment;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Provider-agnostic product payload returned by any BarcodeEnrichmentProvider.
 * Decoupled from JPA entities — the mapper converts this into internal entities.
 */
@Getter
@Builder
public class EnrichedProductData {

    // Source metadata
    private String sourceName;       // e.g. "OPEN_FOOD_FACTS"
    private String sourceProductId;  // provider's own product identifier

    // Product info
    private String barcodeValue;
    private String productName;
    private String brandName;
    private String manufacturer;

    // Package sizing
    private BigDecimal netWeightG;
    private BigDecimal servingSizeG;
    private String servingSizeLabel;

    // Nutrition — always per 100g
    private EnrichedNutritionData nutrition;

    // Optional image URL from provider
    private String imageUrl;

    // Raw JSON from the provider response for audit trail
    private String rawJson;
}
