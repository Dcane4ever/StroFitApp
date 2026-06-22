export interface RecipeIngredient {
  id: string;
  foodItemId: string;
  foodName: string;
  brandName: string | null;
  servingUnitId: string;
  servingLabel: string;
  quantity: number;
  totalGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  estimatedCost: number | null;
}

export interface RecipeServingOption {
  id: string;
  label: string;
  isDefault: boolean;
  // Two paths — one will be non-null
  fractionOfRecipe: number | null;   // e.g. 0.5 = half recipe
  gramsEquivalent: number | null;    // e.g. 150 = 150g
  caloriesPerServing: number | null;
  proteinGPerServing: number | null;
  carbsGPerServing: number | null;
  fatGPerServing: number | null;
}

export interface RecipeNutritionTotals {
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  totalEstimatedCost: number | null;
}

export interface RecipeSummary {
  id: string;
  name: string;
  notes: string | null;
  ingredientCount: number;
  servingOptionCount: number;
  nutrition: RecipeNutritionTotals | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeDetail extends RecipeSummary {
  ingredients: RecipeIngredient[];
  servingOptions: RecipeServingOption[];
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export interface CreateRecipeRequest {
  name: string;
  notes?: string | null;
}

export interface UpdateRecipeRequest {
  name: string;
  notes?: string | null;
}

export interface AddRecipeIngredientRequest {
  foodItemId: string;
  servingUnitId: string;
  quantity: number;
}

export interface UpdateRecipeIngredientRequest {
  servingUnitId: string;
  quantity: number;
}

export interface AddRecipeServingOptionRequest {
  label: string;
  isDefault?: boolean;
  fractionOfRecipe?: number | null;
  gramsEquivalent?: number | null;
}

export interface UpdateRecipeServingOptionRequest {
  label: string;
  isDefault?: boolean;
  fractionOfRecipe?: number | null;
  gramsEquivalent?: number | null;
}
