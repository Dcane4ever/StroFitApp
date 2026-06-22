import { useState, useCallback, useEffect } from 'react';
import { getDailyBudgetSummary, getBudgetRangeSummary } from '../api/budget';
import { DailyBudgetSummaryResponse, BudgetRangeSummaryResponse } from '../types/budget';

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

interface UseBudgetOverviewResult {
  daily: DailyBudgetSummaryResponse | null;
  range: BudgetRangeSummaryResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBudgetOverview(date: string): UseBudgetOverviewResult {
  const [daily, setDaily] = useState<DailyBudgetSummaryResponse | null>(null);
  const [range, setRange] = useState<BudgetRangeSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = nDaysAgo(6);
    try {
      const [d, r] = await Promise.allSettled([
        getDailyBudgetSummary(date),
        getBudgetRangeSummary(start, date),
      ]);
      setDaily(d.status === 'fulfilled' ? d.value : null);
      setRange(r.status === 'fulfilled' ? r.value : null);
      if (d.status === 'rejected' && r.status === 'rejected') {
        setError('Failed to load budget data');
      }
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetch(); }, [fetch]);

  return { daily, range, loading, error, refresh: fetch };
}
