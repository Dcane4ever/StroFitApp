import apiClient from './client';
import { FoodSearchResult, FoodDetail, ServingUnit } from '../types/food';

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  const res = await apiClient.get('/foods/search', { params: { q: query } });
  // Backend returns ApiResponse<Page<FoodSearchResult>> or ApiResponse<List<...>>
  const data = res.data.data;
  // Handle both paginated (data.content) and plain list responses
  const items: any[] = Array.isArray(data) ? data : (data?.content ?? []);
  return items.map(mapToSearchResult);
}

export async function getFoodDetail(foodItemId: string): Promise<FoodDetail> {
  const res = await apiClient.get(`/foods/${foodItemId}`);
  return mapToFoodDetail(res.data.data);
}

// ─── Mappers (snake_case backend → camelCase frontend) ────────────────────────

function mapToSearchResult(raw: any): FoodSearchResult {
  // Backend may return serving units or a defaultServingUnit nested object
  const defaultServing = raw.default_serving_unit ?? raw.defaultServingUnit ?? null;
  const nutrition = raw.nutrition ?? raw.food_nutrition ?? null;

  return {
    foodItemId: raw.food_item_id ?? raw.foodItemId ?? raw.id,
    foodName: raw.food_name ?? raw.foodName ?? raw.name,
    brandName: raw.brand_name ?? raw.brandName ?? null,
    brandedProductId: raw.branded_product_id ?? raw.brandedProductId ?? null,
    source: raw.source ?? raw.food_source ?? null,
    caloriesPer100g: nutrition?.calories_per_100g ?? nutrition?.caloriesPer100g ?? raw.calories_per_100g ?? 0,
    proteinPer100g: nutrition?.protein_g_per_100g ?? nutrition?.proteinGPer100g ?? raw.protein_g_per_100g ?? 0,
    carbsPer100g: nutrition?.carbs_g_per_100g ?? nutrition?.carbsGPer100g ?? raw.carbs_g_per_100g ?? 0,
    fatPer100g: nutrition?.fat_g_per_100g ?? nutrition?.fatGPer100g ?? raw.fat_g_per_100g ?? 0,
    defaultServingLabel: defaultServing?.label ?? null,
    defaultServingGrams: defaultServing?.grams_equivalent ?? defaultServing?.gramsEquivalent ?? null,
    caloriesPerServing: null,
  };
}

function mapToFoodDetail(raw: any): FoodDetail {
  const nutrition = raw.nutrition ?? raw.food_nutrition ?? raw;
  const servingUnits: ServingUnit[] = (raw.serving_units ?? raw.servingUnits ?? []).map(mapToServingUnit);

  return {
    foodItemId: raw.food_item_id ?? raw.foodItemId ?? raw.id,
    foodName: raw.food_name ?? raw.foodName ?? raw.name,
    brandName: raw.brand_name ?? raw.brandName ?? null,
    brandedProductId: raw.branded_product_id ?? raw.brandedProductId ?? null,
    source: raw.source ?? raw.food_source ?? null,
    servingUnits,
    caloriesPer100g: nutrition.calories_per_100g ?? nutrition.caloriesPer100g ?? 0,
    proteinPer100g: nutrition.protein_g_per_100g ?? nutrition.proteinGPer100g ?? 0,
    carbsPer100g: nutrition.carbs_g_per_100g ?? nutrition.carbsGPer100g ?? 0,
    fatPer100g: nutrition.fat_g_per_100g ?? nutrition.fatGPer100g ?? 0,
    fiberPer100g: nutrition.fiber_g_per_100g ?? nutrition.fiberGPer100g ?? null,
  };
}

function mapToServingUnit(raw: any): ServingUnit {
  return {
    id: raw.id ?? raw.serving_unit_id ?? raw.servingUnitId,
    label: raw.label ?? raw.serving_label ?? raw.servingLabel,
    gramsEquivalent: raw.grams_equivalent ?? raw.gramsEquivalent ?? null,
    quantityPerUnit: raw.quantity_per_unit ?? raw.quantityPerUnit ?? null,
    unitType: raw.unit_type ?? raw.unitType ?? null,
  };
}
