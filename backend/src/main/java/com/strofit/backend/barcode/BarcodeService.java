package com.strofit.backend.barcode;

import com.strofit.backend.barcode.dto.BarcodeLookupResponse;
import com.strofit.backend.barcode.enrichment.BarcodeEnrichmentService;
import com.strofit.backend.barcode.enrichment.EnrichedProductData;
import com.strofit.backend.food.dto.FoodItemResponse;
import com.strofit.backend.food.dto.FoodNutritionResponse;
import com.strofit.backend.food.dto.FoodServingUnitResponse;
import com.strofit.backend.food.dto.StorePriceResponse;
import com.strofit.backend.food.entity.BrandedProduct;
import com.strofit.backend.food.entity.FoodItem;
import com.strofit.backend.food.entity.ProductBarcode;
import com.strofit.backend.food.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BarcodeService {

    private final ProductBarcodeRepository barcodeRepository;
    private final FoodNutritionRepository nutritionRepository;
    private final FoodServingUnitRepository servingUnitRepository;
    private final StorePriceRepository storePriceRepository;
    private final BarcodeEnrichmentService enrichmentService;

    @Transactional
    public BarcodeLookupResponse lookup(String barcodeValue) {
        // 1. Local lookup
        Optional<ProductBarcode> localResult = barcodeRepository.findByBarcodeValue(barcodeValue);
        if (localResult.isPresent()) {
            log.debug("Barcode {} found locally", barcodeValue);
            return buildLocalResponse(localResult.get(), barcodeValue);
        }

        // 2. External enrichment
        log.debug("Barcode {} not found locally, attempting enrichment", barcodeValue);
        Optional<EnrichedProductData> enriched = enrichmentService.enrich(barcodeValue);
        if (enriched.isPresent()) {
            // Enrichment persisted by BarcodeEnrichmentService; re-query to get the full entity graph
            Optional<ProductBarcode> freshBarcode = barcodeRepository.findByBarcodeValue(barcodeValue);
            if (freshBarcode.isPresent()) {
                return buildEnrichedResponse(freshBarcode.get(), enriched.get(), barcodeValue);
            }
        }

        // 3. Not found anywhere
        return BarcodeLookupResponse.notFound(barcodeValue);
    }

    // -------------------------------------------------------------------------
    // Response builders
    // -------------------------------------------------------------------------

    private BarcodeLookupResponse buildLocalResponse(ProductBarcode barcode, String barcodeValue) {
        BrandedProduct product = barcode.getBrandedProduct();
        FoodItem food = product.getFoodItem();
        FoodItemResponse foodItemResponse = buildFoodItemResponse(food);

        return BarcodeLookupResponse.builder()
                .barcodeValue(barcodeValue)
                .status(BarcodeLookupResponse.LookupStatus.FOUND_LOCAL)
                .foundLocally(true)
                .enrichedExternally(false)
                .productId(product.getId())
                .productName(product.getProductName())
                .brandName(product.getBrandName())
                .imageUrl(product.getImageUrl())
                .netWeightG(product.getNetWeightG())
                .servingSizeG(product.getServingSizeG())
                .servingSizeLabel(product.getServingSizeLabel())
                .sourceName(food.getExternalSourceName())
                .foodItem(foodItemResponse)
                .build();
    }

    private BarcodeLookupResponse buildEnrichedResponse(ProductBarcode barcode,
                                                         EnrichedProductData enriched,
                                                         String barcodeValue) {
        BrandedProduct product = barcode.getBrandedProduct();
        FoodItem food = product.getFoodItem();
        FoodItemResponse foodItemResponse = buildFoodItemResponse(food);

        return BarcodeLookupResponse.builder()
                .barcodeValue(barcodeValue)
                .status(BarcodeLookupResponse.LookupStatus.FOUND_ENRICHED)
                .foundLocally(false)
                .enrichedExternally(true)
                .productId(product.getId())
                .productName(product.getProductName())
                .brandName(product.getBrandName())
                .imageUrl(product.getImageUrl())
                .netWeightG(product.getNetWeightG())
                .servingSizeG(product.getServingSizeG())
                .servingSizeLabel(product.getServingSizeLabel())
                .sourceName(enriched.getSourceName())
                .foodItem(foodItemResponse)
                .build();
    }

    private FoodItemResponse buildFoodItemResponse(FoodItem food) {
        FoodNutritionResponse nutrition = nutritionRepository
                .findByFoodItemId(food.getId())
                .map(FoodNutritionResponse::from)
                .orElse(null);

        List<FoodServingUnitResponse> servingUnits = servingUnitRepository
                .findByFoodItemIdOrderBySortOrderAsc(food.getId())
                .stream()
                .map(FoodServingUnitResponse::from)
                .toList();

        List<StorePriceResponse> prices = storePriceRepository
                .findByFoodItemIdAndActiveTrue(food.getId())
                .stream()
                .map(StorePriceResponse::from)
                .toList();

        return FoodItemResponse.fromWithDetails(food, nutrition, servingUnits, prices);
    }
}
