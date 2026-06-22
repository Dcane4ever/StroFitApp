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

export interface DailySpendEntry {
  date: string;
  totalSpentPhp: number;
  budgetLimitPhp: number | null;
  overBudget: boolean;
}

export interface BudgetRangeSummaryResponse {
  startDate: string;
  endDate: string;
  totalSpentPhp: number;
  averageDailySpendPhp: number;
  daysOverBudget: number;
  totalDays: number;
  budgetLimitPhp: number | null;
  dailyEntries: DailySpendEntry[];
}
