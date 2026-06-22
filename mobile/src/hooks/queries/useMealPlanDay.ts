import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMealPlanByDate } from '../../api/mealPlan';
import { QK } from '../../lib/queryKeys';

export function useMealPlanDay(date: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.mealPlan(date),
    queryFn: () => getMealPlanByDate(date), // returns null when no plan exists
    staleTime: 30_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: QK.mealPlan(date) });

  return {
    plan: query.data ?? null,
    loading: query.isLoading,
    error: query.isError && !query.data ? (query.error as any)?.message ?? 'Failed to load meal plan' : null,
    refresh,
  };
}
