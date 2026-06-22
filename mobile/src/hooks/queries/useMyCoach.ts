import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyCoach } from '../../api/coaching';
import { QK } from '../../lib/queryKeys';

export function useMyCoach() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.myCoach(),
    queryFn: getMyCoach, // returns null on 404
    staleTime: 60_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: QK.myCoach() });

  return {
    coach: query.data ?? null,
    loading: query.isLoading,
    error: query.isError && !query.data ? (query.error as any)?.message ?? 'Failed to load coach info' : null,
    refresh,
  };
}
