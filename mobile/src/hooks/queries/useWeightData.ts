import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWeightLogs, getWeightSummary } from '../../api/weight';
import { QK } from '../../lib/queryKeys';

export function useWeightData() {
  const qc = useQueryClient();

  const logsQuery = useQuery({
    queryKey: QK.weightLogs(),
    queryFn: async () => {
      const data = await getWeightLogs({});
      return [...data].sort(
        (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
      );
    },
    staleTime: 60_000,
  });

  const summaryQuery = useQuery({
    queryKey: QK.weightSummary(),
    queryFn: () => getWeightSummary(),
    staleTime: 60_000,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: QK.weightLogs() });
    qc.invalidateQueries({ queryKey: QK.weightSummary() });
  };

  const loading = logsQuery.isLoading || summaryQuery.isLoading;
  const hasNoCache = !logsQuery.data && !summaryQuery.data;
  const bothFailed = logsQuery.isError && summaryQuery.isError;

  return {
    logs: logsQuery.data ?? [],
    summary: summaryQuery.data ?? null,
    loading,
    error: bothFailed && hasNoCache ? (logsQuery.error as any)?.message ?? 'Failed to load weight data' : null,
    refresh,
  };
}
