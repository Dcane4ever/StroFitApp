package com.strofit.backend.diary.service;

import com.strofit.backend.common.exception.AppException;
import com.strofit.backend.common.exception.ResourceNotFoundException;
import com.strofit.backend.diary.dto.*;
import com.strofit.backend.diary.entity.DiaryEntry;
import com.strofit.backend.diary.entity.DiaryEntryItem;
import com.strofit.backend.diary.enums.MealType;
import com.strofit.backend.diary.repository.DiaryEntryItemRepository;
import com.strofit.backend.diary.repository.DiaryEntryRepository;
import com.strofit.backend.food.entity.FoodItem;
import com.strofit.backend.food.entity.FoodNutrition;
import com.strofit.backend.food.entity.FoodServingUnit;
import com.strofit.backend.food.entity.StorePrice;
import com.strofit.backend.food.repository.FoodItemRepository;
import com.strofit.backend.food.repository.FoodNutritionRepository;
import com.strofit.backend.food.repository.FoodServingUnitRepository;
import com.strofit.backend.food.repository.StorePriceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryEntryRepository diaryEntryRepository;
    private final DiaryEntryItemRepository diaryEntryItemRepository;
    private final FoodItemRepository foodItemRepository;
    private final FoodNutritionRepository nutritionRepository;
    private final FoodServingUnitRepository servingUnitRepository;
    private final StorePriceRepository storePriceRepository;

    // -------------------------------------------------------------------------
    // GET /diary?date=
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public DiaryDayResponse getDiary(UUID userId, LocalDate date) {
        Optional<DiaryEntry> entry = diaryEntryRepository.findByUserIdAndEntryDate(userId, date);

        if (entry.isEmpty()) {
            // No items logged yet — return empty day view without writing a row
            return emptyDay(date);
        }

        List<DiaryEntryItem> items = diaryEntryItemRepository
                .findByDiaryEntryIdOrderByLoggedAtAsc(entry.get().getId());

        return buildDayResponse(entry.get(), items);
    }

    // -------------------------------------------------------------------------
    // POST /diary/items
    // -------------------------------------------------------------------------

    @Transactional
    public DiaryItemResponse addItem(UUID userId, AddDiaryItemRequest request) {
        validateServingUnit(request.getServingUnitId(), request.getServingUnitLabel(), request.getGramsPerUnit());

        FoodItem food = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item"));

        FoodNutrition nutrition = nutritionRepository.findByFoodItemId(food.getId())
                .orElseThrow(() -> new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "NO_NUTRITION", "Food item has no nutrition data"));

        // Resolve serving unit
        ServingUnitResolution unit = resolveServingUnit(
                request.getServingUnitId(),
                request.getServingUnitLabel(),
                request.getGramsPerUnit(),
                food.getId()
        );

        BigDecimal totalGrams = request.getQuantity()
                .multiply(unit.gramsPerUnit())
                .setScale(3, RoundingMode.HALF_UP);

        NutritionSnapshot snapshot = computeNutrition(nutrition, totalGrams);

        // Cheapest active price snapshot
        PriceSnapshot price = resolvePrice(food.getId(), request.getBrandedProductId());

        // Auto-create diary entry on first log for this date
        DiaryEntry entry = diaryEntryRepository
                .findByUserIdAndEntryDate(userId, request.getDate())
                .orElseGet(() -> diaryEntryRepository.save(
                        DiaryEntry.builder()
                                .userId(userId)
                                .entryDate(request.getDate())
                                .build()
                ));

        DiaryEntryItem item = DiaryEntryItem.builder()
                .diaryEntry(entry)
                .foodItemId(food.getId())
                .brandedProductId(request.getBrandedProductId())
                .mealType(request.getMealType())
                .quantity(request.getQuantity())
                .servingUnitId(unit.id())
                .servingUnitLabel(unit.label())
                .gramsPerUnit(unit.gramsPerUnit())
                .totalGrams(totalGrams)
                .calories(snapshot.calories())
                .proteinG(snapshot.proteinG())
                .carbsG(snapshot.carbsG())
                .fatG(snapshot.fatG())
                .fiberG(snapshot.fiberG())
                .foodNameSnapshot(food.getName())
                .brandNameSnapshot(resolveBrandName(request.getBrandedProductId()))
                .priceAmount(price.amount())
                .priceCurrency(price.currency())
                .priceSourceNote(price.sourceNote())
                .notes(request.getNotes())
                .loggedAt(Instant.now())
                .build();

        item = diaryEntryItemRepository.save(item);
        log.info("Diary item added: food={} user={} date={}", food.getId(), userId, request.getDate());
        return DiaryItemResponse.from(item);
    }

    // -------------------------------------------------------------------------
    // PUT /diary/items/{itemId}
    // -------------------------------------------------------------------------

    @Transactional
    public DiaryItemResponse updateItem(UUID userId, UUID itemId, UpdateDiaryItemRequest request) {
        validateServingUnit(request.getServingUnitId(), request.getServingUnitLabel(), request.getGramsPerUnit());

        DiaryEntryItem item = diaryEntryItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Diary item"));

        // Ownership check
        if (!item.getDiaryEntry().getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }

        FoodNutrition nutrition = nutritionRepository.findByFoodItemId(item.getFoodItemId())
                .orElseThrow(() -> new AppException(HttpStatus.UNPROCESSABLE_ENTITY, "NO_NUTRITION", "Food item has no nutrition data"));

        ServingUnitResolution unit = resolveServingUnit(
                request.getServingUnitId(),
                request.getServingUnitLabel(),
                request.getGramsPerUnit(),
                item.getFoodItemId()
        );

        BigDecimal totalGrams = request.getQuantity()
                .multiply(unit.gramsPerUnit())
                .setScale(3, RoundingMode.HALF_UP);

        NutritionSnapshot snapshot = computeNutrition(nutrition, totalGrams);

        item.setMealType(request.getMealType());
        item.setQuantity(request.getQuantity());
        item.setServingUnitId(unit.id());
        item.setServingUnitLabel(unit.label());
        item.setGramsPerUnit(unit.gramsPerUnit());
        item.setTotalGrams(totalGrams);
        item.setCalories(snapshot.calories());
        item.setProteinG(snapshot.proteinG());
        item.setCarbsG(snapshot.carbsG());
        item.setFatG(snapshot.fatG());
        item.setFiberG(snapshot.fiberG());
        item.setNotes(request.getNotes());

        item = diaryEntryItemRepository.save(item);
        return DiaryItemResponse.from(item);
    }

    // -------------------------------------------------------------------------
    // DELETE /diary/items/{itemId}
    // -------------------------------------------------------------------------

    @Transactional
    public void deleteItem(UUID userId, UUID itemId) {
        DiaryEntryItem item = diaryEntryItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Diary item"));

        if (!item.getDiaryEntry().getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }

        diaryEntryItemRepository.delete(item);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private ServingUnitResolution resolveServingUnit(
            UUID servingUnitId, String label, BigDecimal gramsPerUnit, UUID foodItemId) {

        if (servingUnitId != null) {
            FoodServingUnit unit = servingUnitRepository.findById(servingUnitId)
                    .orElseThrow(() -> new ResourceNotFoundException("Serving unit"));
            return new ServingUnitResolution(unit.getId(), unit.getUnitLabel(), unit.getGramsPerUnit());
        }

        if (StringUtils.hasText(label) && gramsPerUnit != null) {
            return new ServingUnitResolution(null, label, gramsPerUnit);
        }

        // Fall back to the food's default serving unit
        return servingUnitRepository.findByFoodItemIdAndDefaultUnitTrue(foodItemId)
                .map(u -> new ServingUnitResolution(u.getId(), u.getUnitLabel(), u.getGramsPerUnit()))
                .orElseGet(() -> new ServingUnitResolution(null, "g", BigDecimal.ONE));
    }

    private NutritionSnapshot computeNutrition(FoodNutrition nutrition, BigDecimal totalGrams) {
        // All macro values stored per 100g; scale by totalGrams / 100
        BigDecimal factor = totalGrams.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);

        return new NutritionSnapshot(
                scale(nutrition.getCaloriesPer100g(), factor),
                scale(nutrition.getProteinPer100g(), factor),
                scale(nutrition.getCarbsPer100g(), factor),
                scale(nutrition.getFatPer100g(), factor),
                scale(nutrition.getFiberPer100g(), factor)
        );
    }

    private BigDecimal scale(BigDecimal per100g, BigDecimal factor) {
        if (per100g == null) return null;
        return per100g.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }

    private PriceSnapshot resolvePrice(UUID foodItemId, UUID brandedProductId) {
        List<StorePrice> prices = brandedProductId != null
                ? storePriceRepository.findByBrandedProductIdAndActiveTrue(brandedProductId)
                : storePriceRepository.findByFoodItemIdAndActiveTrue(foodItemId);

        return prices.stream()
                .filter(p -> p.getPricePHP() != null)
                .min(Comparator.comparing(StorePrice::getPricePHP))
                .map(p -> new PriceSnapshot(p.getPricePHP(), "PHP", p.getStoreName()))
                .orElse(new PriceSnapshot(null, null, null));
    }

    private String resolveBrandName(UUID brandedProductId) {
        // Brand name snapshot is populated only when a branded product is linked.
        // Full branded product lookup would require an extra repo; we skip it for MVP
        // and let the client pass it as a snapshot via the food barcode response.
        return null;
    }

    private DiaryDayResponse buildDayResponse(DiaryEntry entry, List<DiaryEntryItem> items) {
        Map<MealType, List<DiaryEntryItem>> grouped = items.stream()
                .collect(Collectors.groupingBy(DiaryEntryItem::getMealType));

        List<MealGroupResponse> meals = Arrays.stream(MealType.values())
                .filter(grouped::containsKey)
                .map(mealType -> {
                    List<DiaryEntryItem> mealItems = grouped.get(mealType);
                    List<DiaryItemResponse> itemResponses = mealItems.stream()
                            .map(DiaryItemResponse::from)
                            .toList();
                    return MealGroupResponse.builder()
                            .mealType(mealType)
                            .items(itemResponses)
                            .totalCalories(sumField(mealItems, DiaryEntryItem::getCalories))
                            .totalProteinG(sumField(mealItems, DiaryEntryItem::getProteinG))
                            .totalCarbsG(sumField(mealItems, DiaryEntryItem::getCarbsG))
                            .totalFatG(sumField(mealItems, DiaryEntryItem::getFatG))
                            .totalFiberG(sumField(mealItems, DiaryEntryItem::getFiberG))
                            .totalPriceAmount(sumField(mealItems, DiaryEntryItem::getPriceAmount))
                            .build();
                })
                .toList();

        return DiaryDayResponse.builder()
                .diaryEntryId(entry.getId())
                .date(entry.getEntryDate())
                .meals(meals)
                .totalCalories(sumField(items, DiaryEntryItem::getCalories))
                .totalProteinG(sumField(items, DiaryEntryItem::getProteinG))
                .totalCarbsG(sumField(items, DiaryEntryItem::getCarbsG))
                .totalFatG(sumField(items, DiaryEntryItem::getFatG))
                .totalFiberG(sumField(items, DiaryEntryItem::getFiberG))
                .totalPriceAmount(sumField(items, DiaryEntryItem::getPriceAmount))
                .totalItems(items.size())
                .build();
    }

    private DiaryDayResponse emptyDay(LocalDate date) {
        return DiaryDayResponse.builder()
                .date(date)
                .meals(List.of())
                .totalCalories(BigDecimal.ZERO)
                .totalProteinG(BigDecimal.ZERO)
                .totalCarbsG(BigDecimal.ZERO)
                .totalFatG(BigDecimal.ZERO)
                .totalFiberG(BigDecimal.ZERO)
                .totalPriceAmount(BigDecimal.ZERO)
                .totalItems(0)
                .build();
    }

    private BigDecimal sumField(List<DiaryEntryItem> items,
                                java.util.function.Function<DiaryEntryItem, BigDecimal> getter) {
        return items.stream()
                .map(getter)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void validateServingUnit(UUID servingUnitId, String label, BigDecimal gramsPerUnit) {
        boolean hasId = servingUnitId != null;
        boolean hasManual = StringUtils.hasText(label) && gramsPerUnit != null;
        // Either is fine; both missing means we'll fall back to the food's default
    }

    // Records used as internal value objects
    private record ServingUnitResolution(UUID id, String label, BigDecimal gramsPerUnit) {}
    private record NutritionSnapshot(BigDecimal calories, BigDecimal proteinG,
                                     BigDecimal carbsG, BigDecimal fatG, BigDecimal fiberG) {}
    private record PriceSnapshot(BigDecimal amount, String currency, String sourceNote) {}
}
