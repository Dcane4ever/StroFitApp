import { MealType } from './diary';

export interface MealPlanItem {
  id: string;
  mealType: MealType;
  // Either food or recipe — one will be non-null
  foodItemId: string | null;
  recipeId: string | null;
  foodName: string;
  brandName: string | null;
  servingUnitId: string | null;
  servingLabel: string | null;
  quantity: number;
  estimatedCalories: number;
  estimatedProteinG: number;
  estimatedCarbsG: number;
  estimatedFatG: number;
  estimatedCostPhp: number | null;
}

export interface MealPlanMealGroup {
  mealType: MealType;
  items: MealPlanItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalCostPhp: number | null;
}

export interface MealPlan {
  id: string;
  planDate: string;
  targetCalories: number | null;
  targetProteinG: number | null;
  targetCarbsG: number | null;
  targetFatG: number | null;
  targetBudgetPhp: number | null;
  meals: MealPlanMealGroup[];
  // Totals aggregated from meals
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalCostPhp: number | null;
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export interface CreateMealPlanRequest {
  planDate: string;
  targetCalories?: number | null;
  targetProteinG?: number | null;
  targetCarbsG?: number | null;
  targetFatG?: number | null;
  targetBudgetPhp?: number | null;
}

export interface UpdateMealPlanRequest {
  targetCalories?: number | null;
  targetProteinG?: number | null;
  targetCarbsG?: number | null;
  targetFatG?: number | null;
  targetBudgetPhp?: number | null;
}

export interface AddMealPlanItemRequest {
  mealType: MealType;
  foodItemId?: string | null;
  recipeId?: string | null;
  servingUnitId?: string | null;
  quantity: number;
}
