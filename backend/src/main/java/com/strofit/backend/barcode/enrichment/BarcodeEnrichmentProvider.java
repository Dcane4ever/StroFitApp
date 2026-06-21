package com.strofit.backend.barcode.enrichment;

import java.util.Optional;

/**
 * Pluggable barcode enrichment provider.
 * Implement this interface and annotate with @Component to register a new provider.
 * BarcodeEnrichmentService iterates registered providers in priority order.
 */
public interface BarcodeEnrichmentProvider {

    /**
     * Human-readable provider name used in logs and BarcodeLookupLog records.
     */
    String getProviderName();

    /**
     * Priority for provider ordering — lower value runs first.
     */
    int getPriority();

    /**
     * Look up a barcode. Return empty if the product is not found or the request fails.
     * Implementations must not throw unchecked exceptions — catch and return empty.
     */
    Optional<EnrichedProductData> lookup(String barcodeValue);
}
