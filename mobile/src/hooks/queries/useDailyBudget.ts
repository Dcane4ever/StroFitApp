import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDailyBudgetSummary } from '../../api/budget';
import { QK } from '../../lib/queryKeys';

export function useDailyBudget(date: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.dailyBudget(date),
    queryFn: async () => {
      try {
        return await getDailyBudgetSummary(date);
      } catch (err: any) {
        // Budget goal not set → treat as null, not an error
        if (err?.status === 404 || err?.code === 'GOAL_NOT_FOUND') return null;
        throw err;
      }
    },
    staleTime: 30_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: QK.dailyBudget(date) });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.isError && !query.data ? (query.error as any)?.message ?? 'Failed to load budget' : null,
    refresh,
  };
}
