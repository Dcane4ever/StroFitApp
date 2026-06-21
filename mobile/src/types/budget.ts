export interface MealBudgetBreakdown {
  mealType: string;
  totalSpent: number;
}

export interface DailyBudgetSummaryResponse {
  date: string;
  budgetLimitPhp: number | null;
  totalSpentPhp: number;
  remainingPhp: number | null;
  percentUsed: number | null;
  mealBreakdown: MealBudgetBreakdown[];
}
