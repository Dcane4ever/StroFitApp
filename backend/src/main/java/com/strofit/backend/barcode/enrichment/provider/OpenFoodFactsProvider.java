package com.strofit.backend.barcode.enrichment.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.strofit.backend.barcode.enrichment.BarcodeEnrichmentProvider;
import com.strofit.backend.barcode.enrichment.EnrichedNutritionData;
import com.strofit.backend.barcode.enrichment.EnrichedProductData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * OpenFoodFacts provider — free, no API key required.
 * Covers many Filipino branded products (Jack 'n Jill, Goya, Monde, etc.)
 * API reference: https://world.openfoodfacts.org/api/v2/product/{barcode}.json
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OpenFoodFactsProvider implements BarcodeEnrichmentProvider {

    private static final String BASE_URL =
            "https://world.openfoodfacts.org/api/v2/product/%s.json?fields=product_name,brands,manufacturers,nutriments,serving_size,product_quantity,image_url,id";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public String getProviderName() {
        return "OPEN_FOOD_FACTS";
    }

    @Override
    public int getPriority() {
        return 10;
    }

    @Override
    public Optional<EnrichedProductData> lookup(String barcodeValue) {
        String url = String.format(BASE_URL, barcodeValue);
        try {
            String responseBody = restTemplate.getForObject(url, String.class);
            if (responseBody == null) return Optional.empty();

            JsonNode root = objectMapper.readTree(responseBody);

            // OFF returns status=0 when product not found
            if (root.path("status").asInt() != 1) {
                log.debug("OFF: product not found for barcode {}", barcodeValue);
                return Optional.empty();
            }

            JsonNode product = root.path("product");
            JsonNode nutriments = product.path("nutriments");

            EnrichedNutritionData nutrition = EnrichedNutritionData.builder()
                    .caloriesPer100g(decimal(nutriments, "energy-kcal_100g"))
                    .proteinPer100g(decimal(nutriments, "proteins_100g"))
                    .carbsPer100g(decimal(nutriments, "carbohydrates_100g"))
                    .fatPer100g(decimal(nutriments, "fat_100g"))
                    .fiberPer100g(decimal(nutriments, "fiber_100g"))
                    .sugarPer100g(decimal(nutriments, "sugars_100g"))
                    .sodiumPer100mg(decimal(nutriments, "sodium_100g"))
                    .build();

            // Nutrition is useless without at least calories
            if (nutrition.getCaloriesPer100g() == null) {
                log.debug("OFF: barcode {} found but has no calorie data", barcodeValue);
                return Optional.empty();
            }

            String productName = textOrNull(product, "product_name");
            String brandName   = textOrNull(product, "brands");
            String sourceId    = textOrNull(product, "id");

            BigDecimal netWeightG   = decimal(product, "product_quantity");
            BigDecimal servingSizeG = parseServingSizeG(product.path("serving_size").asText(null));

            return Optional.of(EnrichedProductData.builder()
                    .sourceName(getProviderName())
                    .sourceProductId(sourceId != null ? sourceId : barcodeValue)
                    .barcodeValue(barcodeValue)
                    .productName(productName)
                    .brandName(brandName)
                    .netWeightG(netWeightG)
                    .servingSizeG(servingSizeG)
                    .servingSizeLabel(product.path("serving_size").asText(null))
                    .imageUrl(textOrNull(product, "image_url"))
                    .nutrition(nutrition)
                    .rawJson(responseBody)
                    .build());

        } catch (Exception e) {
            log.warn("OFF lookup failed for barcode {}: {}", barcodeValue, e.getMessage());
            return Optional.empty();
        }
    }

    private BigDecimal decimal(JsonNode node, String field) {
        JsonNode value = node.path(field);
        if (value.isMissingNode() || value.isNull()) return null;
        try {
            return new BigDecimal(value.asText());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String textOrNull(JsonNode node, String field) {
        String value = node.path(field).asText(null);
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private BigDecimal parseServingSizeG(String servingSize) {
        if (servingSize == null || servingSize.isBlank()) return null;
        try {
            // Handle "30 g", "30g", "30.5 g" patterns
            String cleaned = servingSize.replaceAll("[^0-9.]", "").trim();
            if (cleaned.isEmpty()) return null;
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
