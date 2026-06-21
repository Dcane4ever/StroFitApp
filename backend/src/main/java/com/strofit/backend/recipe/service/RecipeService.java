package com.strofit.backend.recipe.service;

import com.strofit.backend.common.exception.AppException;
import com.strofit.backend.common.exception.ResourceNotFoundException;
import com.strofit.backend.food.entity.FoodItem;
import com.strofit.backend.food.entity.FoodNutrition;
import com.strofit.backend.food.entity.FoodServingUnit;
import com.strofit.backend.food.entity.StorePrice;
import com.strofit.backend.food.repository.FoodItemRepository;
import com.strofit.backend.food.repository.FoodNutritionRepository;
import com.strofit.backend.food.repository.FoodServingUnitRepository;
import com.strofit.backend.food.repository.StorePriceRepository;
import com.strofit.backend.recipe.dto.*;
import com.strofit.backend.recipe.entity.Recipe;
import com.strofit.backend.recipe.entity.RecipeIngredient;
import com.strofit.backend.recipe.entity.RecipeServingOption;
import com.strofit.backend.recipe.repository.RecipeIngredientRepository;
import com.strofit.backend.recipe.repository.RecipeRepository;
import com.strofit.backend.recipe.repository.RecipeServingOptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository ingredientRepository;
    private final RecipeServingOptionRepository servingOptionRepository;
    private final FoodItemRepository foodItemRepository;
    private final FoodNutritionRepository nutritionRepository;
    private final FoodServingUnitRepository servingUnitRepository;
    private final StorePriceRepository storePriceRepository;

    // -------------------------------------------------------------------------
    // POST /recipes
    // -------------------------------------------------------------------------

    @Transactional
    public RecipeDetailResponse createRecipe(UUID userId, CreateRecipeRequest request) {
        Recipe recipe = Recipe.builder()
                .userId(userId)
                .name(request.getName().trim())
                .description(request.getDescription())
                .notes(request.getNotes())
                .totalServings(request.getTotalServings())
                .defaultServingLabel(request.getDefaultServingLabel())
                .build();

        recipe = recipeRepository.save(recipe);

        if (request.getIngredients() != null) {
            for (AddIngredientRequest ing : request.getIngredients()) {
                addIngredientToRecipe(recipe, ing);
            }
        }

        if (request.getServingOptions() != null) {
            for (AddServingOptionRequest opt : request.getServingOptions()) {
                addServingOptionToRecipe(recipe, opt);
            }
        }

        return buildDetailResponse(recipe);
    }

    // -------------------------------------------------------------------------
    // GET /recipes
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<RecipeSummaryResponse> listRecipes(UUID userId) {
        List<Recipe> recipes = recipeRepository.findByUserIdOrderByUpdatedAtDesc(userId);

        return recipes.stream().map(recipe -> {
            List<RecipeIngredient> ingredients =
                    ingredientRepository.findByRecipeIdOrderByIngredientOrderAscCreatedAtAsc(recipe.getId());

            RecipeNutritionTotals totals = computeTotals(ingredients);
            BigDecimal caloriesPerServing = divideByServings(totals.getCalories(), recipe.getTotalServings());

            return RecipeSummaryResponse.from(recipe, ingredients.size(), totals.getCalories(), caloriesPerServing);
        }).toList();
    }

    // -------------------------------------------------------------------------
    // GET /recipes/{recipeId}
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public RecipeDetailResponse getRecipe(UUID userId, UUID recipeId) {
        Recipe recipe = findOwnedRecipe(userId, recipeId);
        return buildDetailResponse(recipe);
    }

    // -------------------------------------------------------------------------
    // PUT /recipes/{recipeId}
    // -------------------------------------------------------------------------

    @Transactional
    public RecipeDetailResponse updateRecipe(UUID userId, UUID recipeId, UpdateRecipeRequest request) {
        Recipe recipe = findOwnedRecipe(userId, recipeId);

        recipe.setName(request.getName().trim());
        recipe.setDescription(request.getDescription());
        recipe.setNotes(request.getNotes());
        recipe.setTotalServings(request.getTotalServings());
        recipe.setDefaultServingLabel(request.getDefaultServingLabel());

        recipe = recipeRepository.save(recipe);
        return buildDetailResponse(recipe);
    }

    // -------------------------------------------------------------------------
    // DELETE /recipes/{recipeId}
    // -------------------------------------------------------------------------

    @Transactional
    public void deleteRecipe(UUID userId, UUID recipeId) {
        Recipe recipe = findOwnedRecipe(userId, recipeId);
        recipeRepository.delete(recipe);
    }

    // -------------------------------------------------------------------------
    // POST /recipes/{recipeId}/ingredients
    // -------------------------------------------------------------------------

    @Transactional
    public RecipeIngredientResponse addIngredient(UUID userId, UUID recipeId, AddIngredientRequest request) {
        Recipe recipe = findOwnedRecipe(userId, recipeId);
        RecipeIngredient ingredient = addIngredientToRecipe(recipe, request);
        FoodServingUnit unit = servingUnitRepository.findById(ingredient.getServingUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Serving unit"));
        FoodNutrition nutrition = nutritionRepository.findByFoodItemId(ingredient.getFoodItemId()).orElse(null);
        BigDecimal totalGrams = ingredient.getQuantity().multiply(unit.getGramsPerUnit())
                .setScale(3, RoundingMode.HALF_UP);
        RecipeNutritionTotals ingNutrition = computeIngredientNutrition(nutrition, totalGrams);
        return RecipeIngredientResponse.from(ingredient, unit.getUnitLabel(), unit.getGramsPerUnit(), totalGrams, ingNutrition);
    }

    // -------------------------------------------------------------------------
    // PUT /recipes/{recipeId}/ingredients/{ingredientId}
    // -------------------------------------------------------------------------

    @Transactional
    public RecipeIngredientResponse updateIngredient(UUID userId, UUID recipeId,
                                                     UUID ingredientId, UpdateIngredientRequest request) {
        findOwnedRecipe(userId, recipeId);

        RecipeIngredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient"));
        if (!ingredient.getRecipe().getId().equals(recipeId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }

        FoodServingUnit unit = servingUnitRepository.findById(request.getServingUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Serving unit"));

        ingredient.setQuantity(request.getQuantity());
        ingredient.setServingUnitId(unit.getId());
        ingredient.setIngredientOrder(request.getIngredientOrder());
        ingredient.setIngredientNote(request.getIngredientNote());
        ingredient = ingredientRepository.save(ingredient);

        BigDecimal totalGrams = ingredient.getQuantity().multiply(unit.getGramsPerUnit())
                .setScale(3, RoundingMode.HALF_UP);
        FoodNutrition nutrition = nutritionRepository.findByFoodItemId(ingredient.getFoodItemId()).orElse(null);
        RecipeNutritionTotals ingNutrition = computeIngredientNutrition(nutrition, totalGrams);

        return RecipeIngredientResponse.from(ingredient, unit.getUnitLabel(), unit.getGramsPerUnit(), totalGrams, ingNutrition);
    }

    // -------------------------------------------------------------------------
    // DELETE /recipes/{recipeId}/ingredients/{ingredientId}
    // -------------------------------------------------------------------------

    @Transactional
    public void deleteIngredient(UUID userId, UUID recipeId, UUID ingredientId) {
        findOwnedRecipe(userId, recipeId);
        RecipeIngredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient"));
        if (!ingredient.getRecipe().getId().equals(recipeId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }
        ingredientRepository.delete(ingredient);
    }

    // -------------------------------------------------------------------------
    // POST /recipes/{recipeId}/servings
    // -------------------------------------------------------------------------

    @Transactional
    public RecipeServingOptionResponse addServingOption(UUID userId, UUID recipeId,
                                                        AddServingOptionRequest request) {
        Recipe recipe = findOwnedRecipe(userId, recipeId);
        RecipeServingOption option = addServingOptionToRecipe(recipe, request);

        List<RecipeIngredient> ingredients =
                ingredientRepository.findByRecipeIdOrderByIngredientOrderAscCreatedAtAsc(recipeId);
        RecipeNutritionTotals totals = computeTotals(ingredients);
        RecipeNutritionTotals perServing = computePerServingNutrition(totals, option, ingredients);

        return RecipeServingOptionResponse.from(option, perServing);
    }

    // -------------------------------------------------------------------------
    // PUT /recipes/{recipeId}/servings/{servingId}
    // -------------------------------------------------------------------------

    @Transactional
    public RecipeServingOptionResponse updateServingOption(UUID userId, UUID recipeId,
                                                           UUID servingId, UpdateServingOptionRequest request) {
        findOwnedRecipe(userId, recipeId);

        RecipeServingOption option = servingOptionRepository.findById(servingId)
                .orElseThrow(() -> new ResourceNotFoundException("Serving option"));
        if (!option.getRecipe().getId().equals(recipeId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }

        // If marking this as default, clear existing default first
        if (request.isDefaultOption() && !option.isDefaultOption()) {
            servingOptionRepository.findByRecipeIdAndDefaultOptionTrue(recipeId)
                    .ifPresent(existing -> {
                        existing.setDefaultOption(false);
                        servingOptionRepository.save(existing);
                    });
        }

        option.setLabel(request.getLabel());
        option.setQuantity(request.getQuantity());
        option.setGramsEquivalent(request.getGramsEquivalent());
        option.setFractionOfRecipe(request.getFractionOfRecipe());
        option.setDefaultOption(request.isDefaultOption());
        option.setDisplayOrder(request.getDisplayOrder());
        option = servingOptionRepository.save(option);

        List<RecipeIngredient> ingredients =
                ingredientRepository.findByRecipeIdOrderByIngredientOrderAscCreatedAtAsc(recipeId);
        RecipeNutritionTotals totals = computeTotals(ingredients);
        RecipeNutritionTotals perServing = computePerServingNutrition(totals, option, ingredients);

        return RecipeServingOptionResponse.from(option, perServing);
    }

    // -------------------------------------------------------------------------
    // DELETE /recipes/{recipeId}/servings/{servingId}
    // -------------------------------------------------------------------------

    @Transactional
    public void deleteServingOption(UUID userId, UUID recipeId, UUID servingId) {
        findOwnedRecipe(userId, recipeId);
        RecipeServingOption option = servingOptionRepository.findById(servingId)
                .orElseThrow(() -> new ResourceNotFoundException("Serving option"));
        if (!option.getRecipe().getId().equals(recipeId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }
        servingOptionRepository.delete(option);
    }

    // -------------------------------------------------------------------------
    // Private: build full detail response
    // -------------------------------------------------------------------------

    private RecipeDetailResponse buildDetailResponse(Recipe recipe) {
        List<RecipeIngredient> ingredients =
                ingredientRepository.findByRecipeIdOrderByIngredientOrderAscCreatedAtAsc(recipe.getId());
        List<RecipeServingOption> servingOptions =
                servingOptionRepository.findByRecipeIdOrderByDisplayOrderAscCreatedAtAsc(recipe.getId());

        // Batch-load serving units and nutrition for all ingredients
        Set<UUID> unitIds = ingredients.stream()
                .map(RecipeIngredient::getServingUnitId)
                .collect(Collectors.toSet());
        Map<UUID, FoodServingUnit> unitsById = servingUnitRepository.findAllById(unitIds).stream()
                .collect(Collectors.toMap(FoodServingUnit::getId, u -> u));

        Set<UUID> foodIds = ingredients.stream()
                .map(RecipeIngredient::getFoodItemId)
                .collect(Collectors.toSet());
        Map<UUID, FoodNutrition> nutritionByFoodId = nutritionRepository.findAllByFoodItemIdIn(foodIds).stream()
                .collect(Collectors.toMap(n -> n.getFoodItem().getId(), n -> n));

        // Build ingredient responses with per-ingredient nutrition
        List<RecipeIngredientResponse> ingredientResponses = ingredients.stream().map(ing -> {
            FoodServingUnit unit = unitsById.get(ing.getServingUnitId());
            BigDecimal gramsPerUnit = unit != null ? unit.getGramsPerUnit() : BigDecimal.ONE;
            String unitLabel = unit != null ? unit.getUnitLabel() : "g";
            BigDecimal totalGrams = ing.getQuantity().multiply(gramsPerUnit).setScale(3, RoundingMode.HALF_UP);
            FoodNutrition nutrition = nutritionByFoodId.get(ing.getFoodItemId());
            RecipeNutritionTotals ingNutrition = computeIngredientNutrition(nutrition, totalGrams);
            return RecipeIngredientResponse.from(ing, unitLabel, gramsPerUnit, totalGrams, ingNutrition);
        }).toList();

        // Recipe totals = sum of all ingredient nutrition
        RecipeNutritionTotals totals = sumIngredientResponses(ingredientResponses);

        // Per-default-serving nutrition
        RecipeNutritionTotals perDefaultServing = divideNutritionByServings(totals, recipe.getTotalServings());

        // Serving option responses with per-option nutrition
        List<RecipeServingOptionResponse> servingOptionResponses = servingOptions.stream().map(opt -> {
            RecipeNutritionTotals perServing = computePerServingNutrition(totals, opt, ingredients);
            return RecipeServingOptionResponse.from(opt, perServing);
        }).toList();

        // Cost estimation
        BigDecimal totalCost = estimateTotalCost(ingredients);
        BigDecimal costPerServing = divideByServings(totalCost, recipe.getTotalServings());

        return RecipeDetailResponse.builder()
                .id(recipe.getId())
                .userId(recipe.getUserId())
                .name(recipe.getName())
                .description(recipe.getDescription())
                .notes(recipe.getNotes())
                .totalServings(recipe.getTotalServings())
                .defaultServingLabel(recipe.getDefaultServingLabel())
                .ingredients(ingredientResponses)
                .servingOptions(servingOptionResponses)
                .totalNutrition(totals)
                .nutritionPerDefaultServing(perDefaultServing)
                .estimatedTotalCostPhp(totalCost)
                .estimatedCostPerServingPhp(costPerServing)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }

    // -------------------------------------------------------------------------
    // Private: ingredient + serving helpers
    // -------------------------------------------------------------------------

    private RecipeIngredient addIngredientToRecipe(Recipe recipe, AddIngredientRequest request) {
        FoodItem food = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item"));
        servingUnitRepository.findById(request.getServingUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Serving unit"));

        RecipeIngredient ingredient = RecipeIngredient.builder()
                .recipe(recipe)
                .foodItemId(food.getId())
                .brandedProductId(request.getBrandedProductId())
                .quantity(request.getQuantity())
                .servingUnitId(request.getServingUnitId())
                .ingredientOrder(request.getIngredientOrder())
                .ingredientNote(request.getIngredientNote())
                .foodNameSnapshot(food.getName())
                .brandNameSnapshot(null)
                .build();

        return ingredientRepository.save(ingredient);
    }

    private RecipeServingOption addServingOptionToRecipe(Recipe recipe, AddServingOptionRequest request) {
        if (request.isDefaultOption()) {
            servingOptionRepository.findByRecipeIdAndDefaultOptionTrue(recipe.getId())
                    .ifPresent(existing -> {
                        existing.setDefaultOption(false);
                        servingOptionRepository.save(existing);
                    });
        }

        RecipeServingOption option = RecipeServingOption.builder()
                .recipe(recipe)
                .label(request.getLabel())
                .quantity(request.getQuantity())
                .gramsEquivalent(request.getGramsEquivalent())
                .fractionOfRecipe(request.getFractionOfRecipe())
                .defaultOption(request.isDefaultOption())
                .displayOrder(request.getDisplayOrder())
                .build();

        return servingOptionRepository.save(option);
    }

    // -------------------------------------------------------------------------
    // Private: nutrition computation
    // -------------------------------------------------------------------------

    private RecipeNutritionTotals computeTotals(List<RecipeIngredient> ingredients) {
        Set<UUID> unitIds = ingredients.stream()
                .map(RecipeIngredient::getServingUnitId).collect(Collectors.toSet());
        Map<UUID, FoodServingUnit> unitsById = servingUnitRepository.findAllById(unitIds).stream()
                .collect(Collectors.toMap(FoodServingUnit::getId, u -> u));

        Set<UUID> foodIds = ingredients.stream()
                .map(RecipeIngredient::getFoodItemId).collect(Collectors.toSet());
        Map<UUID, FoodNutrition> nutritionByFoodId = nutritionRepository.findAllByFoodItemIdIn(foodIds).stream()
                .collect(Collectors.toMap(n -> n.getFoodItem().getId(), n -> n));

        BigDecimal calories = BigDecimal.ZERO;
        BigDecimal protein  = BigDecimal.ZERO;
        BigDecimal carbs    = BigDecimal.ZERO;
        BigDecimal fat      = BigDecimal.ZERO;
        BigDecimal fiber    = BigDecimal.ZERO;

        for (RecipeIngredient ing : ingredients) {
            FoodServingUnit unit = unitsById.get(ing.getServingUnitId());
            BigDecimal gramsPerUnit = unit != null ? unit.getGramsPerUnit() : BigDecimal.ONE;
            BigDecimal totalGrams = ing.getQuantity().multiply(gramsPerUnit).setScale(3, RoundingMode.HALF_UP);
            FoodNutrition nutrition = nutritionByFoodId.get(ing.getFoodItemId());
            RecipeNutritionTotals ingNutrition = computeIngredientNutrition(nutrition, totalGrams);
            calories = calories.add(nullSafe(ingNutrition.getCalories()));
            protein  = protein.add(nullSafe(ingNutrition.getProteinG()));
            carbs    = carbs.add(nullSafe(ingNutrition.getCarbsG()));
            fat      = fat.add(nullSafe(ingNutrition.getFatG()));
            fiber    = fiber.add(nullSafe(ingNutrition.getFiberG()));
        }

        return RecipeNutritionTotals.builder()
                .calories(calories.setScale(2, RoundingMode.HALF_UP))
                .proteinG(protein.setScale(2, RoundingMode.HALF_UP))
                .carbsG(carbs.setScale(2, RoundingMode.HALF_UP))
                .fatG(fat.setScale(2, RoundingMode.HALF_UP))
                .fiberG(fiber.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private RecipeNutritionTotals sumIngredientResponses(List<RecipeIngredientResponse> ingredientResponses) {
        BigDecimal calories = BigDecimal.ZERO;
        BigDecimal protein  = BigDecimal.ZERO;
        BigDecimal carbs    = BigDecimal.ZERO;
        BigDecimal fat      = BigDecimal.ZERO;
        BigDecimal fiber    = BigDecimal.ZERO;

        for (RecipeIngredientResponse r : ingredientResponses) {
            if (r.getNutrition() == null) continue;
            calories = calories.add(nullSafe(r.getNutrition().getCalories()));
            protein  = protein.add(nullSafe(r.getNutrition().getProteinG()));
            carbs    = carbs.add(nullSafe(r.getNutrition().getCarbsG()));
            fat      = fat.add(nullSafe(r.getNutrition().getFatG()));
            fiber    = fiber.add(nullSafe(r.getNutrition().getFiberG()));
        }

        return RecipeNutritionTotals.builder()
                .calories(calories.setScale(2, RoundingMode.HALF_UP))
                .proteinG(protein.setScale(2, RoundingMode.HALF_UP))
                .carbsG(carbs.setScale(2, RoundingMode.HALF_UP))
                .fatG(fat.setScale(2, RoundingMode.HALF_UP))
                .fiberG(fiber.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private RecipeNutritionTotals computeIngredientNutrition(FoodNutrition nutrition, BigDecimal totalGrams) {
        if (nutrition == null) return RecipeNutritionTotals.zero();
        BigDecimal factor = totalGrams.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP);
        return RecipeNutritionTotals.builder()
                .calories(scale(nutrition.getCaloriesPer100g(), factor))
                .proteinG(scale(nutrition.getProteinPer100g(), factor))
                .carbsG(scale(nutrition.getCarbsPer100g(), factor))
                .fatG(scale(nutrition.getFatPer100g(), factor))
                .fiberG(scale(nutrition.getFiberPer100g(), factor))
                .build();
    }

    private RecipeNutritionTotals computePerServingNutrition(RecipeNutritionTotals totals,
                                                              RecipeServingOption option,
                                                              List<RecipeIngredient> ingredients) {
        // Priority 1: explicit fraction_of_recipe
        if (option.getFractionOfRecipe() != null) {
            return multiplyNutrition(totals, option.getFractionOfRecipe());
        }

        // Priority 2: grams_equivalent — compute recipe total grams, then proportion
        if (option.getGramsEquivalent() != null) {
            BigDecimal recipeTotalGrams = computeRecipeTotalGrams(ingredients);
            if (recipeTotalGrams.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal fraction = option.getGramsEquivalent()
                        .divide(recipeTotalGrams, 8, RoundingMode.HALF_UP);
                return multiplyNutrition(totals, fraction);
            }
        }

        return RecipeNutritionTotals.zero();
    }

    private BigDecimal computeRecipeTotalGrams(List<RecipeIngredient> ingredients) {
        Set<UUID> unitIds = ingredients.stream()
                .map(RecipeIngredient::getServingUnitId).collect(Collectors.toSet());
        Map<UUID, BigDecimal> gramsById = servingUnitRepository.findAllById(unitIds).stream()
                .collect(Collectors.toMap(FoodServingUnit::getId, FoodServingUnit::getGramsPerUnit));

        return ingredients.stream()
                .map(ing -> ing.getQuantity().multiply(
                        gramsById.getOrDefault(ing.getServingUnitId(), BigDecimal.ONE)))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(3, RoundingMode.HALF_UP);
    }

    private RecipeNutritionTotals multiplyNutrition(RecipeNutritionTotals totals, BigDecimal factor) {
        return RecipeNutritionTotals.builder()
                .calories(scale(totals.getCalories(), factor))
                .proteinG(scale(totals.getProteinG(), factor))
                .carbsG(scale(totals.getCarbsG(), factor))
                .fatG(scale(totals.getFatG(), factor))
                .fiberG(scale(totals.getFiberG(), factor))
                .build();
    }

    private RecipeNutritionTotals divideNutritionByServings(RecipeNutritionTotals totals,
                                                             BigDecimal totalServings) {
        if (totalServings == null || totalServings.compareTo(BigDecimal.ZERO) == 0) return null;
        BigDecimal factor = BigDecimal.ONE.divide(totalServings, 8, RoundingMode.HALF_UP);
        return multiplyNutrition(totals, factor);
    }

    // -------------------------------------------------------------------------
    // Private: cost estimation
    // -------------------------------------------------------------------------

    private BigDecimal estimateTotalCost(List<RecipeIngredient> ingredients) {
        BigDecimal total = BigDecimal.ZERO;
        boolean anyPrice = false;

        for (RecipeIngredient ing : ingredients) {
            List<StorePrice> prices = ing.getBrandedProductId() != null
                    ? storePriceRepository.findByBrandedProductIdAndActiveTrue(ing.getBrandedProductId())
                    : storePriceRepository.findByFoodItemIdAndActiveTrue(ing.getFoodItemId());

            Optional<StorePrice> cheapest = prices.stream()
                    .filter(p -> p.getPricePHP() != null && p.getQuantityG() != null
                            && p.getQuantityG().compareTo(BigDecimal.ZERO) > 0)
                    .min(Comparator.comparing(StorePrice::getPricePHP));

            if (cheapest.isPresent()) {
                anyPrice = true;
                StorePrice price = cheapest.get();
                // Resolve total grams for this ingredient
                FoodServingUnit unit = servingUnitRepository.findById(ing.getServingUnitId()).orElse(null);
                BigDecimal gramsPerUnit = unit != null ? unit.getGramsPerUnit() : BigDecimal.ONE;
                BigDecimal totalGrams = ing.getQuantity().multiply(gramsPerUnit);
                // price_php / quantity_g = price per gram; multiply by ingredient grams
                BigDecimal costForIngredient = price.getPricePHP()
                        .divide(price.getQuantityG(), 6, RoundingMode.HALF_UP)
                        .multiply(totalGrams)
                        .setScale(2, RoundingMode.HALF_UP);
                total = total.add(costForIngredient);
            }
        }

        return anyPrice ? total.setScale(2, RoundingMode.HALF_UP) : null;
    }

    // -------------------------------------------------------------------------
    // Private: misc
    // -------------------------------------------------------------------------

    private Recipe findOwnedRecipe(UUID userId, UUID recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe"));
        if (!recipe.getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }
        return recipe;
    }

    private BigDecimal scale(BigDecimal value, BigDecimal factor) {
        if (value == null) return null;
        return value.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private BigDecimal divideByServings(BigDecimal value, BigDecimal totalServings) {
        if (value == null || totalServings == null || totalServings.compareTo(BigDecimal.ZERO) == 0) return null;
        return value.divide(totalServings, 2, RoundingMode.HALF_UP);
    }
}
