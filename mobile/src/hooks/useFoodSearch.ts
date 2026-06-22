import { useState, useEffect, useRef } from 'react';
import { searchFoods } from '../api/food';
import { FoodSearchResult } from '../types/food';

interface UseFoodSearchResult {
  results: FoodSearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (q: string) => void;
}

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

export function useFoodSearch(): UseFoodSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchFoods(query.trim());
        setResults(data);
      } catch (err: any) {
        setError(err?.message ?? 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, loading, error, query, setQuery };
}
