import apiClient from './client';
import {
  RecipeSummary, RecipeDetail, RecipeIngredient,
  RecipeServingOption, RecipeNutritionTotals,
  CreateRecipeRequest, UpdateRecipeRequest,
  AddRecipeIngredientRequest, UpdateRecipeIngredientRequest,
  AddRecipeServingOptionRequest, UpdateRecipeServingOptionRequest,
} from '../types/recipe';

// ─── Recipe CRUD ──────────────────────────────────────────────────────────────

export async function getRecipes(): Promise<RecipeSummary[]> {
  const res = await apiClient.get('/recipes');
  const data = res.data.data;
  const items: any[] = Array.isArray(data) ? data : (data?.content ?? []);
  return items.map(mapSummary);
}

export async function getRecipeDetail(id: string): Promise<RecipeDetail> {
  const res = await apiClient.get(`/recipes/${id}`);
  return mapDetail(res.data.data);
}

export async function createRecipe(payload: CreateRecipeRequest): Promise<RecipeSummary> {
  const res = await apiClient.post('/recipes', payload);
  return mapSummary(res.data.data);
}

export async function updateRecipe(id: string, payload: UpdateRecipeRequest): Promise<RecipeSummary> {
  const res = await apiClient.put(`/recipes/${id}`, payload);
  return mapSummary(res.data.data);
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiClient.delete(`/recipes/${id}`);
}

// ─── Ingredients ──────────────────────────────────────────────────────────────

export async function addRecipeIngredient(
  recipeId: string,
  payload: AddRecipeIngredientRequest,
): Promise<RecipeIngredient> {
  const res = await apiClient.post(`/recipes/${recipeId}/ingredients`, payload);
  return mapIngredient(res.data.data);
}

export async function updateRecipeIngredient(
  recipeId: string,
  ingredientId: string,
  payload: UpdateRecipeIngredientRequest,
): Promise<RecipeIngredient> {
  const res = await apiClient.put(`/recipes/${recipeId}/ingredients/${ingredientId}`, payload);
  return mapIngredient(res.data.data);
}

export async function deleteRecipeIngredient(recipeId: string, ingredientId: string): Promise<void> {
  await apiClient.delete(`/recipes/${recipeId}/ingredients/${ingredientId}`);
}

// ─── Serving Options ──────────────────────────────────────────────────────────

export async function addRecipeServingOption(
  recipeId: string,
  payload: AddRecipeServingOptionRequest,
): Promise<RecipeServingOption> {
  const res = await apiClient.post(`/recipes/${recipeId}/servings`, payload);
  return mapServingOption(res.data.data);
}

export async function updateRecipeServingOption(
  recipeId: string,
  servingOptionId: string,
  payload: UpdateRecipeServingOptionRequest,
): Promise<RecipeServingOption> {
  const res = await apiClient.put(`/recipes/${recipeId}/servings/${servingOptionId}`, payload);
  return mapServingOption(res.data.data);
}

export async function deleteRecipeServingOption(recipeId: string, servingOptionId: string): Promise<void> {
  await apiClient.delete(`/recipes/${recipeId}/servings/${servingOptionId}`);
}

// ─── Mappers (snake_case → camelCase) ────────────────────────────────────────

function mapNutrition(raw: any): RecipeNutritionTotals | null {
  if (!raw) return null;
  return {
    totalCalories: raw.total_calories ?? raw.totalCalories ?? 0,
    totalProteinG: raw.total_protein_g ?? raw.totalProteinG ?? 0,
    totalCarbsG: raw.total_carbs_g ?? raw.totalCarbsG ?? 0,
    totalFatG: raw.total_fat_g ?? raw.totalFatG ?? 0,
    totalFiberG: raw.total_fiber_g ?? raw.totalFiberG ?? 0,
    totalEstimatedCost: raw.total_estimated_cost ?? raw.totalEstimatedCost ?? null,
  };
}

function mapSummary(raw: any): RecipeSummary {
  return {
    id: raw.id ?? raw.recipe_id ?? raw.recipeId,
    name: raw.name ?? raw.recipe_name ?? raw.recipeName,
    notes: raw.notes ?? null,
    ingredientCount: raw.ingredient_count ?? raw.ingredientCount ?? (raw.ingredients?.length ?? 0),
    servingOptionCount: raw.serving_option_count ?? raw.servingOptionCount ?? (raw.serving_options?.length ?? raw.servingOptions?.length ?? 0),
    nutrition: mapNutrition(raw.nutrition ?? raw.nutrition_totals ?? raw.nutritionTotals ?? null),
    createdAt: raw.created_at ?? raw.createdAt ?? '',
    updatedAt: raw.updated_at ?? raw.updatedAt ?? '',
  };
}

function mapIngredient(raw: any): RecipeIngredient {
  return {
    id: raw.id ?? raw.ingredient_id ?? raw.ingredientId,
    foodItemId: raw.food_item_id ?? raw.foodItemId,
    foodName: raw.food_name ?? raw.foodName ?? raw.food_name_snapshot ?? raw.foodNameSnapshot,
    brandName: raw.brand_name ?? raw.brandName ?? raw.brand_name_snapshot ?? raw.brandNameSnapshot ?? null,
    servingUnitId: raw.serving_unit_id ?? raw.servingUnitId,
    servingLabel: raw.serving_label ?? raw.servingLabel ?? raw.serving_unit_label ?? raw.servingUnitLabel ?? '',
    quantity: raw.quantity ?? 1,
    totalGrams: raw.total_grams ?? raw.totalGrams ?? 0,
    calories: raw.calories ?? 0,
    proteinG: raw.protein_g ?? raw.proteinG ?? 0,
    carbsG: raw.carbs_g ?? raw.carbsG ?? 0,
    fatG: raw.fat_g ?? raw.fatG ?? 0,
    fiberG: raw.fiber_g ?? raw.fiberG ?? null,
    estimatedCost: raw.estimated_cost ?? raw.estimatedCost ?? null,
  };
}

function mapServingOption(raw: any): RecipeServingOption {
  return {
    id: raw.id ?? raw.serving_option_id ?? raw.servingOptionId,
    label: raw.label,
    isDefault: raw.is_default ?? raw.isDefault ?? false,
    fractionOfRecipe: raw.fraction_of_recipe ?? raw.fractionOfRecipe ?? null,
    gramsEquivalent: raw.grams_equivalent ?? raw.gramsEquivalent ?? null,
    caloriesPerServing: raw.calories_per_serving ?? raw.caloriesPerServing ?? null,
    proteinGPerServing: raw.protein_g_per_serving ?? raw.proteinGPerServing ?? null,
    carbsGPerServing: raw.carbs_g_per_serving ?? raw.carbsGPerServing ?? null,
    fatGPerServing: raw.fat_g_per_serving ?? raw.fatGPerServing ?? null,
  };
}

function mapDetail(raw: any): RecipeDetail {
  const ingredients: RecipeIngredient[] = (raw.ingredients ?? []).map(mapIngredient);
  const servingOptions: RecipeServingOption[] = (raw.serving_options ?? raw.servingOptions ?? []).map(mapServingOption);
  return {
    ...mapSummary(raw),
    ingredients,
    servingOptions,
    ingredientCount: ingredients.length,
    servingOptionCount: servingOptions.length,
  };
}
