import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRecipeDetail } from '../../api/recipe';
import { QK } from '../../lib/queryKeys';

export function useRecipeDetail(id: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.recipe(id),
    queryFn: () => getRecipeDetail(id),
    staleTime: 60_000,
    enabled: !!id,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: QK.recipe(id) });

  return {
    recipe: query.data ?? null,
    loading: query.isLoading,
    error: query.isError && !query.data ? (query.error as any)?.message ?? 'Failed to load recipe' : null,
    refresh,
  };
}
