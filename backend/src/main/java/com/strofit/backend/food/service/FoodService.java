package com.strofit.backend.food.service;

import com.strofit.backend.common.exception.ResourceNotFoundException;
import com.strofit.backend.food.dto.*;
import com.strofit.backend.food.entity.*;
import com.strofit.backend.food.enums.ConfidenceLevel;
import com.strofit.backend.food.enums.FoodSource;
import com.strofit.backend.food.enums.FoodType;
import com.strofit.backend.food.repository.FoodItemRepository;
import com.strofit.backend.food.repository.FoodNutritionRepository;
import com.strofit.backend.food.repository.FoodServingUnitRepository;
import com.strofit.backend.food.repository.ProductBarcodeRepository;
import com.strofit.backend.food.repository.StorePriceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FoodService {

    private static final int MAX_PAGE_SIZE = 50;

    private final FoodItemRepository foodItemRepository;
    private final FoodNutritionRepository nutritionRepository;
    private final FoodServingUnitRepository servingUnitRepository;
    private final ProductBarcodeRepository barcodeRepository;
    private final StorePriceRepository storePriceRepository;

    // -------------------------------------------------------------------------
    // Search
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public FoodSearchResponse search(String query, int page, int pageSize) {
        if (!StringUtils.hasText(query) || query.trim().length() < 2) {
            return FoodSearchResponse.builder()
                    .results(List.of())
                    .count(0)
                    .total(0)
                    .page(page)
                    .pageSize(pageSize)
                    .hasMore(false)
                    .build();
        }

        int size = Math.min(pageSize, MAX_PAGE_SIZE);
        int offset = page * size;
        String sanitized = query.trim();

        List<FoodItem> items = foodItemRepository.searchByNameOrAlias(sanitized, size, offset);
        long total = foodItemRepository.countSearchResults(sanitized);

        List<FoodItemResponse> results = items.stream()
                .map(FoodItemResponse::from)
                .toList();

        return FoodSearchResponse.builder()
                .results(results)
                .count(results.size())
                .total(total)
                .page(page)
                .pageSize(size)
                .hasMore((long) offset + size < total)
                .build();
    }

    // -------------------------------------------------------------------------
    // Get single food with full details
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public FoodItemResponse getById(UUID id) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item"));

        FoodNutritionResponse nutrition = nutritionRepository.findByFoodItemId(id)
                .map(FoodNutritionResponse::from)
                .orElse(null);

        List<FoodServingUnitResponse> servingUnits = servingUnitRepository
                .findByFoodItemIdOrderBySortOrderAsc(id)
                .stream()
                .map(FoodServingUnitResponse::from)
                .toList();

        List<StorePriceResponse> prices = storePriceRepository
                .findByFoodItemIdAndActiveTrue(id)
                .stream()
                .map(StorePriceResponse::from)
                .toList();

        return FoodItemResponse.fromWithDetails(item, nutrition, servingUnits, prices);
    }

    // -------------------------------------------------------------------------
    // Barcode lookup
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public BarcodeProductResponse getByBarcode(String barcodeValue) {
        ProductBarcode barcode = barcodeRepository.findByBarcodeValue(barcodeValue)
                .orElseThrow(() -> new ResourceNotFoundException("Product with barcode " + barcodeValue));

        BrandedProduct product = barcode.getBrandedProduct();
        FoodItem foodItem = product.getFoodItem();

        FoodNutritionResponse nutrition = nutritionRepository
                .findByFoodItemId(foodItem.getId())
                .map(FoodNutritionResponse::from)
                .orElse(null);

        List<FoodServingUnitResponse> servingUnits = servingUnitRepository
                .findByFoodItemIdOrderBySortOrderAsc(foodItem.getId())
                .stream()
                .map(FoodServingUnitResponse::from)
                .toList();

        List<StorePriceResponse> prices = storePriceRepository
                .findByBrandedProductIdAndActiveTrue(product.getId())
                .stream()
                .map(StorePriceResponse::from)
                .toList();

        FoodItemResponse foodItemResponse = FoodItemResponse.fromWithDetails(
                foodItem, nutrition, servingUnits, prices);

        return BarcodeProductResponse.from(barcode, product, foodItemResponse);
    }

    // -------------------------------------------------------------------------
    // Create custom food
    // -------------------------------------------------------------------------

    @Transactional
    public FoodItemResponse createCustomFood(CreateCustomFoodRequest request, UUID userId) {
        FoodItem foodItem = FoodItem.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .category(request.getCategory())
                .foodType(FoodType.USER_CUSTOM)
                .sourceType(FoodSource.USER)
                .confidenceLevel(ConfidenceLevel.ESTIMATED)
                .verified(false)
                .publicFood(false)
                .createdByUserId(userId)
                .build();

        foodItem = foodItemRepository.save(foodItem);

        FoodNutrition nutrition = FoodNutrition.builder()
                .foodItem(foodItem)
                .caloriesPer100g(request.getCaloriesPer100g())
                .proteinPer100g(request.getProteinPer100g())
                .carbsPer100g(request.getCarbsPer100g())
                .fatPer100g(request.getFatPer100g())
                .fiberPer100g(request.getFiberPer100g())
                .build();

        nutritionRepository.save(nutrition);

        // Create default serving unit if provided
        FoodServingUnit defaultUnit = null;
        if (request.getDefaultUnitType() != null && request.getDefaultUnitGramsPerUnit() != null) {
            String label = StringUtils.hasText(request.getDefaultUnitLabel())
                    ? request.getDefaultUnitLabel()
                    : request.getDefaultUnitType().name().toLowerCase();

            defaultUnit = FoodServingUnit.builder()
                    .foodItem(foodItem)
                    .unitType(request.getDefaultUnitType())
                    .unitLabel(label)
                    .gramsPerUnit(request.getDefaultUnitGramsPerUnit())
                    .defaultUnit(true)
                    .sortOrder(0)
                    .build();

            defaultUnit = servingUnitRepository.save(defaultUnit);

            // Wire the default serving unit FK back onto the food item
            foodItem.setDefaultServingUnitId(defaultUnit.getId());
            foodItemRepository.save(foodItem);
        }

        // Always add a gram unit so the user can always log by weight
        boolean gramUnitExists = request.getDefaultUnitType() != null &&
                request.getDefaultUnitType().name().equals("GRAM");
        if (!gramUnitExists) {
            FoodServingUnit gramUnit = FoodServingUnit.builder()
                    .foodItem(foodItem)
                    .unitType(com.strofit.backend.food.enums.ServingUnitType.GRAM)
                    .unitLabel("g")
                    .gramsPerUnit(java.math.BigDecimal.ONE)
                    .defaultUnit(defaultUnit == null) // gram is default only if no other default set
                    .sortOrder(99)
                    .build();
            FoodServingUnit savedGramUnit = servingUnitRepository.save(gramUnit);

            if (defaultUnit == null) {
                foodItem.setDefaultServingUnitId(savedGramUnit.getId());
                foodItemRepository.save(foodItem);
            }
        }

        log.info("Custom food created: '{}' by user {}", foodItem.getName(), userId);
        return getById(foodItem.getId());
    }
}
