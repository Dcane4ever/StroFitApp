export interface ServingUnit {
  id: string;
  label: string;
  gramsEquivalent: number | null;
  quantityPerUnit: number | null;
  unitType: string | null;
}

export interface FoodSearchResult {
  foodItemId: string;
  foodName: string;
  brandName: string | null;
  brandedProductId: string | null;
  source: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  // Optional: default serving info if backend includes it in search results
  defaultServingLabel: string | null;
  defaultServingGrams: number | null;
  // Calories at default serving (convenience field, may be null)
  caloriesPerServing: number | null;
}

export interface FoodDetail {
  foodItemId: string;
  foodName: string;
  brandName: string | null;
  brandedProductId: string | null;
  source: string | null;
  servingUnits: ServingUnit[];
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
  defaultServingLabel?: string | null;
}
