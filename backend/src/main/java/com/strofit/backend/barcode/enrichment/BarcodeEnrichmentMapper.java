package com.strofit.backend.barcode.enrichment;

import com.strofit.backend.food.entity.*;
import com.strofit.backend.food.enums.ConfidenceLevel;
import com.strofit.backend.food.enums.FoodSource;
import com.strofit.backend.food.enums.FoodType;
import com.strofit.backend.food.enums.ServingUnitType;
import com.strofit.backend.food.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Converts an EnrichedProductData (provider DTO) into internal JPA entities
 * and persists them in one transaction.
 *
 * Persisted entities: FoodItem, FoodNutrition, FoodServingUnit (gram + serving_size),
 * BrandedProduct, ProductBarcode.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BarcodeEnrichmentMapper {

    private final FoodItemRepository foodItemRepository;
    private final FoodNutritionRepository nutritionRepository;
    private final FoodServingUnitRepository servingUnitRepository;
    private final BrandedProductRepository brandedProductRepository;
    private final ProductBarcodeRepository barcodeRepository;

    @Transactional
    public ProductBarcode persist(EnrichedProductData data) {
        String productName = data.getProductName() != null ? data.getProductName() : "Unknown Product";
        String brandName   = data.getBrandName()   != null ? data.getBrandName()   : "Unknown Brand";

        // 1. FoodItem
        FoodItem foodItem = FoodItem.builder()
                .name(productName + " — " + brandName)
                .foodType(FoodType.BRANDED_PRODUCT_BASE)
                .sourceType(resolveSourceType(data.getSourceName()))
                .confidenceLevel(ConfidenceLevel.HIGH)
                .verified(true)
                .publicFood(true)
                .externalSourceName(data.getSourceName())
                .externalSourceId(data.getSourceProductId())
                .lastVerifiedAt(OffsetDateTime.now())
                .rawSourceJson(data.getRawJson())
                .build();

        foodItem = foodItemRepository.save(foodItem);

        // 2. FoodNutrition
        EnrichedNutritionData n = data.getNutrition();
        FoodNutrition nutrition = FoodNutrition.builder()
                .foodItem(foodItem)
                .caloriesPer100g(n.getCaloriesPer100g())
                .proteinPer100g(n.getProteinPer100g())
                .carbsPer100g(n.getCarbsPer100g())
                .fatPer100g(n.getFatPer100g())
                .fiberPer100g(n.getFiberPer100g())
                .sugarPer100g(n.getSugarPer100g())
                .sodiumPer100mg(n.getSodiumPer100mg())
                .perQuantity(data.getServingSizeG())
                .perUnitLabel(data.getServingSizeLabel())
                .build();

        nutritionRepository.save(nutrition);

        // 3. FoodServingUnit — always create a gram unit
        FoodServingUnit gramUnit = FoodServingUnit.builder()
                .foodItem(foodItem)
                .unitType(ServingUnitType.GRAM)
                .unitLabel("g")
                .gramsPerUnit(BigDecimal.ONE)
                .defaultUnit(data.getServingSizeG() == null)
                .sortOrder(99)
                .build();

        gramUnit = servingUnitRepository.save(gramUnit);

        // 4. FoodServingUnit — create a serving-size unit if provider gave us one
        FoodServingUnit defaultUnit = gramUnit;
        if (data.getServingSizeG() != null) {
            String label = data.getServingSizeLabel() != null ? data.getServingSizeLabel() : "serving";
            FoodServingUnit servingUnit = FoodServingUnit.builder()
                    .foodItem(foodItem)
                    .unitType(ServingUnitType.SERVING)
                    .unitLabel(label)
                    .gramsPerUnit(data.getServingSizeG())
                    .defaultUnit(true)
                    .sortOrder(0)
                    .build();
            defaultUnit = servingUnitRepository.save(servingUnit);
        }

        // 5. Wire defaultServingUnitId back on FoodItem (deferred FK pattern)
        foodItem.setDefaultServingUnitId(defaultUnit.getId());
        foodItemRepository.save(foodItem);

        // 6. BrandedProduct
        BrandedProduct product = BrandedProduct.builder()
                .foodItem(foodItem)
                .brandName(brandName)
                .productName(productName)
                .netWeightG(data.getNetWeightG())
                .servingSizeG(data.getServingSizeG())
                .servingSizeLabel(data.getServingSizeLabel())
                .imageUrl(data.getImageUrl())
                .build();

        product = brandedProductRepository.save(product);

        // 7. ProductBarcode
        ProductBarcode barcode = ProductBarcode.builder()
                .brandedProduct(product)
                .barcodeValue(data.getBarcodeValue())
                .barcodeType(detectBarcodeType(data.getBarcodeValue()))
                .primary(true)
                .source(data.getSourceName())
                .build();

        return barcodeRepository.save(barcode);
    }

    private FoodSource resolveSourceType(String sourceName) {
        if (sourceName == null) return FoodSource.CURATED;
        try {
            return FoodSource.valueOf(sourceName);
        } catch (IllegalArgumentException e) {
            return FoodSource.AI_ENRICHED;
        }
    }

    private String detectBarcodeType(String value) {
        if (value == null) return "UNKNOWN";
        return switch (value.length()) {
            case 8  -> "EAN8";
            case 12 -> "UPC_A";
            case 13 -> "EAN13";
            default -> "UNKNOWN";
        };
    }
}
