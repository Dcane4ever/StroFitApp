import { useState, useCallback, useEffect } from 'react';
import { getTraineeSummary } from '../api/coaching';
import { TraineeSummaryResponse } from '../types/coaching';

interface UseTraineeSummaryResult {
  summary: TraineeSummaryResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTraineeSummary(traineeId: string): UseTraineeSummaryResult {
  const [summary, setSummary] = useState<TraineeSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTraineeSummary(traineeId);
      setSummary(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load trainee summary');
    } finally {
      setLoading(false);
    }
  }, [traineeId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, loading, error, refresh: fetch };
}
