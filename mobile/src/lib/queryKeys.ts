// Central query key factory — import from here, never hardcode strings in hooks
export const QK = {
  // Diary
  diary: (date: string) => ['diary', date] as const,

  // Budget
  dailyBudget: (date: string) => ['budget', 'daily', date] as const,
  budgetRange: (start: string, end: string) => ['budget', 'range', start, end] as const,

  // Meal plan
  mealPlan: (date: string) => ['mealPlan', date] as const,

  // Recipes
  recipes: () => ['recipes'] as const,
  recipe: (id: string) => ['recipes', id] as const,

  // Weight
  weightLogs: () => ['weight', 'logs'] as const,
  weightSummary: () => ['weight', 'summary'] as const,

  // Coaching
  coachTrainees: () => ['coaching', 'trainees'] as const,
  traineeSummary: (id: string) => ['coaching', 'trainees', id, 'summary'] as const,
  myCoach: () => ['coaching', 'myCoach'] as const,
} as const;
