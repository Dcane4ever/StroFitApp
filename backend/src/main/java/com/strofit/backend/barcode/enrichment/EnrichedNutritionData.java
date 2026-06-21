package com.strofit.backend.barcode.enrichment;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Provider-agnostic nutrition payload returned by any BarcodeEnrichmentProvider.
 * All values are per 100g to match the internal storage model.
 */
@Getter
@Builder
public class EnrichedNutritionData {

    private BigDecimal caloriesPer100g;
    private BigDecimal proteinPer100g;
    private BigDecimal carbsPer100g;
    private BigDecimal fatPer100g;
    private BigDecimal fiberPer100g;
    private BigDecimal sugarPer100g;
    private BigDecimal sodiumPer100mg;
}
