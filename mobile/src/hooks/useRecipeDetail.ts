import { useState, useCallback, useEffect } from 'react';
import { getRecipeDetail } from '../api/recipe';
import { RecipeDetail } from '../types/recipe';

interface UseRecipeDetailResult {
  recipe: RecipeDetail | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRecipeDetail(id: string): UseRecipeDetailResult {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipeDetail(id);
      setRecipe(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { recipe, loading, error, refresh: fetch };
}
