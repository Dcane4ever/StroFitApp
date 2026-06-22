import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRecipes } from '../../api/recipe';
import { QK } from '../../lib/queryKeys';

export function useRecipes() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.recipes(),
    queryFn: getRecipes,
    staleTime: 60_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: QK.recipes() });

  return {
    recipes: query.data ?? [],
    loading: query.isLoading,
    error: query.isError && !query.data ? (query.error as any)?.message ?? 'Failed to load recipes' : null,
    refresh,
  };
}
