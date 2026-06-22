import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCoachTrainees } from '../../api/coaching';
import { QK } from '../../lib/queryKeys';

export function useCoachTrainees() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.coachTrainees(),
    queryFn: getCoachTrainees,
    staleTime: 60_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: QK.coachTrainees() });

  return {
    trainees: query.data ?? [],
    loading: query.isLoading,
    error: query.isError && !query.data ? (query.error as any)?.message ?? 'Failed to load trainees' : null,
    refresh,
  };
}
