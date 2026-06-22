import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDiaryByDate } from '../../api/diary';
import { QK } from '../../lib/queryKeys';

export function useDiaryDay(date: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.diary(date),
    queryFn: () => getDiaryByDate(date),
    staleTime: 30_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: QK.diary(date) });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    // Only surface error when there's no cached data to show
    error: query.isError && !query.data ? (query.error as any)?.message ?? 'Failed to load diary' : null,
    isRefetching: query.isFetching && !query.isLoading,
    refresh,
  };
}
