import { useState, useCallback, useEffect } from 'react';
import { getRecipes } from '../api/recipe';
import { RecipeSummary } from '../types/recipe';

interface UseRecipesResult {
  recipes: RecipeSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRecipes(): UseRecipesResult {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipes();
      setRecipes(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { recipes, loading, error, refresh: fetch };
}
