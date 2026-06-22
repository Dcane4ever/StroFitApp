export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface DiaryItemResponse {
  id: string;
  foodItemId: string;
  foodName: string;
  brandName: string | null;
  servingUnitId: string;
  servingLabel: string;
  quantity: number;
  totalGrams: number;
  mealType: MealType;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  loggedAt: string;
}

export interface MealGroupResponse {
  mealType: MealType;
  items: DiaryItemResponse[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  totalCost: number | null;
}

export interface DiaryDayResponse {
  entryDate: string;
  meals: MealGroupResponse[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  totalCost: number | null;
}

export interface AddDiaryItemRequest {
  date: string;
  mealType: MealType;
  foodItemId: string;
  brandedProductId?: string | null;
  servingUnitId: string;
  quantity: number;
  notes?: string | null;
}

export interface AddDiaryRecipeRequest {
  date: string;
  mealType: MealType;
  recipeId: string;
  servingOptionId: string;
  quantity: number;
  notes?: string | null;
}
