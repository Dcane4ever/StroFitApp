import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTraineeSummary } from '../../api/coaching';
import { QK } from '../../lib/queryKeys';

export function useTraineeSummary(traineeId: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.traineeSummary(traineeId),
    queryFn: () => getTraineeSummary(traineeId),
    staleTime: 60_000,
    enabled: !!traineeId,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: QK.traineeSummary(traineeId) });

  return {
    summary: query.data ?? null,
    loading: query.isLoading,
    error: query.isError && !query.data ? (query.error as any)?.message ?? 'Failed to load trainee summary' : null,
    refresh,
  };
}
