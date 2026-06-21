import { useState, useEffect, useCallback } from 'react';
import { getDailyBudgetSummary } from '../api/budget';
import { DailyBudgetSummaryResponse } from '../types/budget';

interface UseDailyBudgetResult {
  data: DailyBudgetSummaryResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDailyBudget(date: string): UseDailyBudgetResult {
  const [data, setData] = useState<DailyBudgetSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDailyBudgetSummary(date);
      setData(result);
    } catch (err: any) {
      // Budget goal may not be set — treat as non-fatal
      if (err?.status === 404 || err?.code === 'GOAL_NOT_FOUND') {
        setData(null);
      } else {
        setError(err?.message ?? 'Failed to load budget');
      }
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
