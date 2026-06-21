package com.strofit.backend.mealplan.service;

import com.strofit.backend.common.exception.AppException;
import com.strofit.backend.common.exception.ResourceNotFoundException;
import com.strofit.backend.diary.enums.MealType;
import com.strofit.backend.food.entity.FoodItem;
import com.strofit.backend.food.entity.FoodNutrition;
import com.strofit.backend.food.entity.FoodServingUnit;
import com.strofit.backend.food.entity.StorePrice;
import com.strofit.backend.food.repository.*;
import com.strofit.backend.goal.UserGoal;
import com.strofit.backend.goal.UserGoalRepository;
import com.strofit.backend.mealplan.dto.*;
import com.strofit.backend.mealplan.entity.MealPlan;
import com.strofit.backend.mealplan.entity.MealPlanItem;
import com.strofit.backend.mealplan.repository.MealPlanItemRepository;
import com.strofit.backend.mealplan.repository.MealPlanRepository;
import com.strofit.backend.recipe.entity.Recipe;
import com.strofit.backend.recipe.repository.RecipeRepository;
import com.strofit.backend.recipe.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final MealPlanItemRepository mealPlanItemRepository;
    private final UserGoalRepository goalRepository;
    private final FoodItemRepository foodItemRepository;
    private final FoodNutritionRepository nutritionRepository;
    private final FoodServingUnitRepository servingUnitRepository;
    private final StorePriceRepository storePriceRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeService recipeService;

    // -------------------------------------------------------------------------
    // POST /meal-plans
    // -------------------------------------------------------------------------

    @Transactional
    public MealPlanResponse createMealPlan(UUID userId, CreateMealPlanRequest request) {
        if (mealPlanRepository.findByUserIdAndPlanDate(userId, request.getPlanDate()).isPresent()) {
            throw new AppException(HttpStatus.CONFLICT, "MEAL_PLAN_EXISTS",
                    "A meal plan already exists for " + request.getPlanDate());
        }

        // Snapshot targets from active goal if not provided by caller
        UserGoal goal = goalRepository.findByUserIdAndActiveTrue(userId).orElse(null);

        MealPlan plan = MealPlan.builder()
                .userId(userId)
                .planDate(request.getPlanDate())
                .targetCalories(coalesce(request.getTargetCalories(),
                        goal != null ? BigDecimal.valueOf(goal.getCalorieTarget()) : null))
                .targetProteinG(coalesce(request.getTargetProteinG(),
                        goal != null ? goal.getProteinTargetG() : null))
                .targetCarbsG(coalesce(request.getTargetCarbsG(),
                        goal != null ? goal.getCarbsTargetG() : null))
                .targetFatG(coalesce(request.getTargetFatG(),
                        goal != null ? goal.getFatsTargetG() : null))
                .budgetLimitPhp(coalesce(request.getBudgetLimitPhp(),
                        goal != null ? goal.getDailyBudgetPhp() : null))
                .notes(request.getNotes())
                .build();

        plan = mealPlanRepository.save(plan);
        return buildResponse(plan, List.of());
    }

    // -------------------------------------------------------------------------
    // GET /meal-plans?date=
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public MealPlanResponse getMealPlan(UUID userId, LocalDate date) {
        MealPlan plan = mealPlanRepository.findByUserIdAndPlanDate(userId, date)
                .orElseThrow(() -> new ResourceNotFoundException("Meal plan for " + date));
        List<MealPlanItem> items =
                mealPlanItemRepository.findByMealPlanIdOrderByMealTypeAscSortOrderAsc(plan.getId());
        return buildResponse(plan, items);
    }

    // -------------------------------------------------------------------------
    // PUT /meal-plans/{id}
    // -------------------------------------------------------------------------

    @Transactional
    public MealPlanResponse updateMealPlan(UUID userId, UUID planId, UpdateMealPlanRequest request) {
        MealPlan plan = findOwnedPlan(userId, planId);

        if (request.getTargetCalories() != null) plan.setTargetCalories(request.getTargetCalories());
        if (request.getTargetProteinG() != null) plan.setTargetProteinG(request.getTargetProteinG());
        if (request.getTargetCarbsG() != null) plan.setTargetCarbsG(request.getTargetCarbsG());
        if (request.getTargetFatG() != null) plan.setTargetFatG(request.getTargetFatG());
        if (request.getBudgetLimitPhp() != null) plan.setBudgetLimitPhp(request.getBudgetLimitPhp());
        plan.setNotes(request.getNotes());

        plan = mealPlanRepository.save(plan);
        List<MealPlanItem> items =
                mealPlanItemRepository.findByMealPlanIdOrderByMealTypeAscSortOrderAsc(plan.getId());
        return buildResponse(plan, items);
    }

    // -------------------------------------------------------------------------
    // DELETE /meal-plans/{id}
    // -------------------------------------------------------------------------

    @Transactional
    public void deleteMealPlan(UUID userId, UUID planId) {
        MealPlan plan = findOwnedPlan(userId, planId);
        mealPlanRepository.delete(plan);
    }

    // -------------------------------------------------------------------------
    // POST /meal-plans/{planId}/items
    // -------------------------------------------------------------------------

    @Transactional
    public MealPlanItemResponse addItem(UUID userId, UUID planId, AddMealPlanItemRequest request) {
        MealPlan plan = findOwnedPlan(userId, planId);
        validateItemSource(request.getFoodItemId(), request.getRecipeId());

        MealPlanItem item;
        if (request.getFoodItemId() != null) {
            item = buildFoodItem(plan, request);
        } else {
            item = buildRecipeItem(plan, request);
        }

        return MealPlanItemResponse.from(mealPlanItemRepository.save(item));
    }

    // -------------------------------------------------------------------------
    // DELETE /meal-plans/{planId}/items/{itemId}
    // -------------------------------------------------------------------------

    @Transactional
    public void deleteItem(UUID userId, UUID planId, UUID itemId) {
        findOwnedPlan(userId, planId);
        MealPlanItem item = mealPlanItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Meal plan item"));
        if (!item.getMealPlan().getId().equals(planId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }
        mealPlanItemRepository.delete(item);
    }

    // -------------------------------------------------------------------------
    // Private: build food item
    // -------------------------------------------------------------------------

    private MealPlanItem buildFoodItem(MealPlan plan, AddMealPlanItemRequest request) {
        FoodItem food = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item"));

        FoodServingUnit unit = resolveServingUnit(request.getServingUnitId(), food.getId(),
                food.getDefaultServingUnitId());

        BigDecimal totalGrams = request.getQuantity()
                .multiply(unit.getGramsPerUnit())
                .setScale(3, RoundingMode.HALF_UP);

        FoodNutrition nutrition = nutritionRepository.findByFoodItemId(food.getId()).orElse(null);
        BigDecimal factor = totalGrams.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);

        BigDecimal cheapestCost = resolveCheapestCost(food.getId(), null, unit.getGramsPerUnit(),
                request.getQuantity());

        return MealPlanItem.builder()
                .mealPlan(plan)
                .mealType(request.getMealType())
                .foodItemId(food.getId())
                .quantity(request.getQuantity())
                .servingUnitId(unit.getId())
                .servingUnitLabel(unit.getUnitLabel())
                .plannedCalories(scale(nutrition != null ? nutrition.getCaloriesPer100g() : null, factor))
                .plannedProteinG(scale(nutrition != null ? nutrition.getProteinPer100g() : null, factor))
                .plannedCarbsG(scale(nutrition != null ? nutrition.getCarbsPer100g() : null, factor))
                .plannedFatG(scale(nutrition != null ? nutrition.getFatPer100g() : null, factor))
                .plannedFiberG(scale(nutrition != null ? nutrition.getFiberPer100g() : null, factor))
                .estimatedCostPhp(cheapestCost)
                .itemNameSnapshot(food.getName())
                .sortOrder(request.getSortOrder())
                .build();
    }

    // -------------------------------------------------------------------------
    // Private: build recipe item
    // -------------------------------------------------------------------------

    private MealPlanItem buildRecipeItem(MealPlan plan, AddMealPlanItemRequest request) {
        Recipe recipe = recipeRepository.findById(request.getRecipeId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipe"));

        // Quantity = number of servings of the recipe
        BigDecimal quantity = request.getQuantity();

        // Get recipe totals via service (computes from ingredients)
        var detail = recipeService.getRecipe(recipe.getUserId(), recipe.getId());
        var totals = detail.getTotalNutrition();

        // Scale totals by quantity / totalServings
        BigDecimal factor = BigDecimal.ONE;
        if (recipe.getTotalServings() != null && recipe.getTotalServings().compareTo(BigDecimal.ZERO) > 0) {
            factor = quantity.divide(recipe.getTotalServings(), 6, RoundingMode.HALF_UP);
        }

        BigDecimal cost = detail.getEstimatedTotalCostPhp() != null && recipe.getTotalServings() != null
                ? detail.getEstimatedTotalCostPhp()
                        .multiply(factor)
                        .setScale(2, RoundingMode.HALF_UP)
                : null;

        return MealPlanItem.builder()
                .mealPlan(plan)
                .mealType(request.getMealType())
                .recipeId(recipe.getId())
                .quantity(quantity)
                .servingUnitLabel("serving")
                .plannedCalories(scale(totals.getCalories(), factor))
                .plannedProteinG(scale(totals.getProteinG(), factor))
                .plannedCarbsG(scale(totals.getCarbsG(), factor))
                .plannedFatG(scale(totals.getFatG(), factor))
                .plannedFiberG(scale(totals.getFiberG(), factor))
                .estimatedCostPhp(cost)
                .itemNameSnapshot(recipe.getName())
                .sortOrder(request.getSortOrder())
                .build();
    }

    // -------------------------------------------------------------------------
    // Private: response builder
    // -------------------------------------------------------------------------

    private MealPlanResponse buildResponse(MealPlan plan, List<MealPlanItem> items) {
        Map<MealType, List<MealPlanItem>> grouped = items.stream()
                .collect(Collectors.groupingBy(MealPlanItem::getMealType));

        List<MealPlanMealGroupResponse> meals = Arrays.stream(MealType.values())
                .filter(grouped::containsKey)
                .map(mealType -> {
                    List<MealPlanItem> mealItems = grouped.get(mealType);
                    List<MealPlanItemResponse> itemResponses = mealItems.stream()
                            .map(MealPlanItemResponse::from).toList();
                    return MealPlanMealGroupResponse.builder()
                            .mealType(mealType)
                            .items(itemResponses)
                            .totalPlannedCalories(sumField(mealItems, MealPlanItem::getPlannedCalories))
                            .totalPlannedProteinG(sumField(mealItems, MealPlanItem::getPlannedProteinG))
                            .totalPlannedCarbsG(sumField(mealItems, MealPlanItem::getPlannedCarbsG))
                            .totalPlannedFatG(sumField(mealItems, MealPlanItem::getPlannedFatG))
                            .totalEstimatedCostPhp(sumField(mealItems, MealPlanItem::getEstimatedCostPhp))
                            .build();
                })
                .toList();

        return MealPlanResponse.builder()
                .id(plan.getId())
                .planDate(plan.getPlanDate())
                .targetCalories(plan.getTargetCalories())
                .targetProteinG(plan.getTargetProteinG())
                .targetCarbsG(plan.getTargetCarbsG())
                .targetFatG(plan.getTargetFatG())
                .budgetLimitPhp(plan.getBudgetLimitPhp())
                .notes(plan.getNotes())
                .meals(meals)
                .totalPlannedCalories(sumField(items, MealPlanItem::getPlannedCalories))
                .totalPlannedProteinG(sumField(items, MealPlanItem::getPlannedProteinG))
                .totalPlannedCarbsG(sumField(items, MealPlanItem::getPlannedCarbsG))
                .totalPlannedFatG(sumField(items, MealPlanItem::getPlannedFatG))
                .totalEstimatedCostPhp(sumField(items, MealPlanItem::getEstimatedCostPhp))
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }

    // -------------------------------------------------------------------------
    // Private: misc helpers
    // -------------------------------------------------------------------------

    private MealPlan findOwnedPlan(UUID userId, UUID planId) {
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Meal plan"));
        if (!plan.getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }
        return plan;
    }

    private void validateItemSource(UUID foodItemId, UUID recipeId) {
        if ((foodItemId == null) == (recipeId == null)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_ITEM_SOURCE",
                    "Provide exactly one of food_item_id or recipe_id");
        }
    }

    private FoodServingUnit resolveServingUnit(UUID servingUnitId, UUID foodItemId, UUID defaultUnitId) {
        if (servingUnitId != null) {
            return servingUnitRepository.findById(servingUnitId)
                    .orElseThrow(() -> new ResourceNotFoundException("Serving unit"));
        }
        UUID fallbackId = defaultUnitId != null ? defaultUnitId : null;
        if (fallbackId != null) {
            return servingUnitRepository.findById(fallbackId)
                    .orElseGet(() -> gramUnit(foodItemId));
        }
        return servingUnitRepository.findByFoodItemIdAndDefaultUnitTrue(foodItemId)
                .orElseGet(() -> gramUnit(foodItemId));
    }

    private FoodServingUnit gramUnit(UUID foodItemId) {
        // Fallback in-memory gram unit — food has no serving unit defined
        FoodServingUnit stub = new FoodServingUnit();
        stub.setUnitLabel("g");
        stub.setGramsPerUnit(BigDecimal.ONE);
        return stub;
    }

    private BigDecimal resolveCheapestCost(UUID foodItemId, UUID brandedProductId,
                                           BigDecimal gramsPerUnit, BigDecimal quantity) {
        List<StorePrice> prices = brandedProductId != null
                ? storePriceRepository.findByBrandedProductIdAndActiveTrue(brandedProductId)
                : storePriceRepository.findByFoodItemIdAndActiveTrue(foodItemId);

        return prices.stream()
                .filter(p -> p.getPricePHP() != null && p.getQuantityG() != null
                        && p.getQuantityG().compareTo(BigDecimal.ZERO) > 0)
                .min(Comparator.comparing(StorePrice::getPricePHP))
                .map(p -> {
                    BigDecimal totalGrams = quantity.multiply(gramsPerUnit);
                    return p.getPricePHP()
                            .divide(p.getQuantityG(), 6, RoundingMode.HALF_UP)
                            .multiply(totalGrams)
                            .setScale(2, RoundingMode.HALF_UP);
                })
                .orElse(null);
    }

    private BigDecimal scale(BigDecimal value, BigDecimal factor) {
        if (value == null) return null;
        return value.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal sumField(List<MealPlanItem> items,
                                java.util.function.Function<MealPlanItem, BigDecimal> getter) {
        return items.stream()
                .map(getter)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private <T> T coalesce(T first, T second) {
        return first != null ? first : second;
    }
}
