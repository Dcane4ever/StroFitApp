package com.strofit.backend.barcode.enrichment;

import com.strofit.backend.barcode.entity.BarcodeLookupLog;
import com.strofit.backend.barcode.repository.BarcodeLookupLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Orchestrates external barcode enrichment.
 * Iterates registered BarcodeEnrichmentProvider implementations in priority order.
 * First non-empty result wins. All attempts are logged to barcode_lookup_log.
 */
@Slf4j
@Service
public class BarcodeEnrichmentService {

    private final List<BarcodeEnrichmentProvider> providers;
    private final BarcodeEnrichmentMapper mapper;
    private final BarcodeLookupLogRepository logRepository;

    public BarcodeEnrichmentService(List<BarcodeEnrichmentProvider> providers,
                                    BarcodeEnrichmentMapper mapper,
                                    BarcodeLookupLogRepository logRepository) {
        this.providers = providers.stream()
                .sorted(Comparator.comparingInt(BarcodeEnrichmentProvider::getPriority))
                .toList();
        this.mapper = mapper;
        this.logRepository = logRepository;
        log.info("Barcode enrichment providers registered: {}",
                this.providers.stream().map(BarcodeEnrichmentProvider::getProviderName).toList());
    }

    /**
     * Attempt external enrichment for a barcode.
     * Returns the persisted EnrichedProductData if any provider succeeds, empty otherwise.
     */
    public Optional<EnrichedProductData> enrich(String barcodeValue) {
        for (BarcodeEnrichmentProvider provider : providers) {
            Optional<EnrichedProductData> result = tryProvider(provider, barcodeValue);
            if (result.isPresent()) {
                mapper.persist(result.get());
                return result;
            }
        }
        return Optional.empty();
    }

    private Optional<EnrichedProductData> tryProvider(BarcodeEnrichmentProvider provider,
                                                       String barcodeValue) {
        try {
            Optional<EnrichedProductData> result = provider.lookup(barcodeValue);
            logAttempt(barcodeValue, provider.getProviderName(),
                    result.isPresent() ? BarcodeLookupLog.Status.HIT : BarcodeLookupLog.Status.MISS,
                    null);
            return result;
        } catch (Exception e) {
            log.error("Provider {} threw for barcode {}: {}",
                    provider.getProviderName(), barcodeValue, e.getMessage());
            logAttempt(barcodeValue, provider.getProviderName(), BarcodeLookupLog.Status.ERROR, e.getMessage());
            return Optional.empty();
        }
    }

    private void logAttempt(String barcodeValue, String sourceName,
                             BarcodeLookupLog.Status status, String errorMessage) {
        try {
            logRepository.save(BarcodeLookupLog.builder()
                    .barcodeValue(barcodeValue)
                    .sourceName(sourceName)
                    .status(status.name())
                    .errorMessage(errorMessage)
                    .lookedUpAt(Instant.now())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to write barcode lookup log: {}", e.getMessage());
        }
    }
}
