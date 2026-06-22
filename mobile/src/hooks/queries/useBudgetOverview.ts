import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDailyBudgetSummary, getBudgetRangeSummary } from '../../api/budget';
import { QK } from '../../lib/queryKeys';

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function useBudgetOverview(date: string) {
  const qc = useQueryClient();
  const start = nDaysAgo(6);

  const dailyQuery = useQuery({
    queryKey: QK.dailyBudget(date),
    queryFn: async () => {
      try {
        return await getDailyBudgetSummary(date);
      } catch (err: any) {
        if (err?.status === 404 || err?.code === 'GOAL_NOT_FOUND') return null;
        throw err;
      }
    },
    staleTime: 30_000,
  });

  const rangeQuery = useQuery({
    queryKey: QK.budgetRange(start, date),
    queryFn: () => getBudgetRangeSummary(start, date),
    staleTime: 60_000,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: QK.dailyBudget(date) });
    qc.invalidateQueries({ queryKey: QK.budgetRange(start, date) });
  };

  const loading = dailyQuery.isLoading || rangeQuery.isLoading;
  const bothFailed = dailyQuery.isError && rangeQuery.isError && !dailyQuery.data && !rangeQuery.data;

  return {
    daily: dailyQuery.data ?? null,
    range: rangeQuery.data ?? null,
    loading,
    error: bothFailed ? 'Failed to load budget data' : null,
    refresh,
  };
}
