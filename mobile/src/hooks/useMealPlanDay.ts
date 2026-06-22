import { useState, useCallback, useEffect } from 'react';
import { getMealPlanByDate } from '../api/mealPlan';
import { MealPlan } from '../types/mealPlan';

interface UseMealPlanDayResult {
  plan: MealPlan | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMealPlanDay(date: string): UseMealPlanDayResult {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMealPlanByDate(date);
      setPlan(data); // null = no plan for this date (not an error)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetch(); }, [fetch]);

  return { plan, loading, error, refresh: fetch };
}
