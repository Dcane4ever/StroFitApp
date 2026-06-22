import apiClient from './client';
import {
  MealPlan, MealPlanItem, MealPlanMealGroup,
  CreateMealPlanRequest, UpdateMealPlanRequest, AddMealPlanItemRequest,
} from '../types/mealPlan';
import { MealType } from '../types/diary';

const MEAL_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export async function getMealPlanByDate(date: string): Promise<MealPlan | null> {
  try {
    const res = await apiClient.get('/meal-plans', { params: { date } });
    const data = res.data.data;
    if (!data) return null;
    // Backend may return a list (one plan per date) or a single object
    const raw = Array.isArray(data) ? data[0] : data;
    if (!raw) return null;
    return mapMealPlan(raw);
  } catch (err: any) {
    if (err?.status === 404) return null;
    throw err;
  }
}

export async function createMealPlan(payload: CreateMealPlanRequest): Promise<MealPlan> {
  const res = await apiClient.post('/meal-plans', payload);
  return mapMealPlan(res.data.data);
}

export async function updateMealPlan(id: string, payload: UpdateMealPlanRequest): Promise<MealPlan> {
  const res = await apiClient.put(`/meal-plans/${id}`, payload);
  return mapMealPlan(res.data.data);
}

export async function deleteMealPlan(id: string): Promise<void> {
  await apiClient.delete(`/meal-plans/${id}`);
}

export async function addMealPlanItem(
  planId: string,
  payload: AddMealPlanItemRequest,
): Promise<MealPlanItem> {
  const res = await apiClient.post(`/meal-plans/${planId}/items`, payload);
  return mapItem(res.data.data);
}

export async function deleteMealPlanItem(planId: string, itemId: string): Promise<void> {
  await apiClient.delete(`/meal-plans/${planId}/items/${itemId}`);
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapItem(raw: any): MealPlanItem {
  return {
    id: raw.id ?? raw.item_id ?? raw.itemId,
    mealType: raw.meal_type ?? raw.mealType,
    foodItemId: raw.food_item_id ?? raw.foodItemId ?? null,
    recipeId: raw.recipe_id ?? raw.recipeId ?? null,
    foodName: raw.food_name ?? raw.foodName ?? raw.name ?? '',
    brandName: raw.brand_name ?? raw.brandName ?? null,
    servingUnitId: raw.serving_unit_id ?? raw.servingUnitId ?? null,
    servingLabel: raw.serving_label ?? raw.servingLabel ?? null,
    quantity: raw.quantity ?? 1,
    estimatedCalories: raw.estimated_calories ?? raw.estimatedCalories ?? raw.calories ?? 0,
    estimatedProteinG: raw.estimated_protein_g ?? raw.estimatedProteinG ?? raw.protein_g ?? 0,
    estimatedCarbsG: raw.estimated_carbs_g ?? raw.estimatedCarbsG ?? raw.carbs_g ?? 0,
    estimatedFatG: raw.estimated_fat_g ?? raw.estimatedFatG ?? raw.fat_g ?? 0,
    estimatedCostPhp: raw.estimated_cost_php ?? raw.estimatedCostPhp ?? raw.cost ?? null,
  };
}

function mapMealPlan(raw: any): MealPlan {
  // Backend may return flat item list or pre-grouped meals
  let meals: MealPlanMealGroup[];
  if (raw.meals) {
    meals = raw.meals.map((m: any) => {
      const items = (m.items ?? []).map(mapItem);
      return buildMealGroup(m.meal_type ?? m.mealType, items);
    });
  } else {
    // Flat item list — group client-side
    const items: MealPlanItem[] = (raw.items ?? []).map(mapItem);
    meals = MEAL_ORDER.map(mt => buildMealGroup(mt, items.filter(i => i.mealType === mt)));
  }

  const totals = aggregateTotals(meals);

  return {
    id: raw.id ?? raw.plan_id ?? raw.planId,
    planDate: raw.plan_date ?? raw.planDate ?? raw.date,
    targetCalories: raw.target_calories ?? raw.targetCalories ?? null,
    targetProteinG: raw.target_protein_g ?? raw.targetProteinG ?? null,
    targetCarbsG: raw.target_carbs_g ?? raw.targetCarbsG ?? null,
    targetFatG: raw.target_fat_g ?? raw.targetFatG ?? null,
    targetBudgetPhp: raw.target_budget_php ?? raw.targetBudgetPhp ?? null,
    meals,
    ...totals,
  };
}

function buildMealGroup(mealType: MealType, items: MealPlanItem[]): MealPlanMealGroup {
  return {
    mealType,
    items,
    totalCalories: items.reduce((s, i) => s + i.estimatedCalories, 0),
    totalProteinG: items.reduce((s, i) => s + i.estimatedProteinG, 0),
    totalCarbsG: items.reduce((s, i) => s + i.estimatedCarbsG, 0),
    totalFatG: items.reduce((s, i) => s + i.estimatedFatG, 0),
    totalCostPhp: items.some(i => i.estimatedCostPhp != null)
      ? items.reduce((s, i) => s + (i.estimatedCostPhp ?? 0), 0)
      : null,
  };
}

function aggregateTotals(meals: MealPlanMealGroup[]) {
  return {
    totalCalories: meals.reduce((s, m) => s + m.totalCalories, 0),
    totalProteinG: meals.reduce((s, m) => s + m.totalProteinG, 0),
    totalCarbsG: meals.reduce((s, m) => s + m.totalCarbsG, 0),
    totalFatG: meals.reduce((s, m) => s + m.totalFatG, 0),
    totalCostPhp: meals.some(m => m.totalCostPhp != null)
      ? meals.reduce((s, m) => s + (m.totalCostPhp ?? 0), 0)
      : null,
  };
}
