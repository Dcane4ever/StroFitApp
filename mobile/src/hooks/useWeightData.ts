import { useState, useCallback, useEffect } from 'react';
import { getWeightLogs, getWeightSummary } from '../api/weight';
import { WeightLog, WeightProgressSummaryResponse } from '../types/weight';

interface UseWeightDataResult {
  logs: WeightLog[];
  summary: WeightProgressSummaryResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWeightData(): UseWeightDataResult {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [summary, setSummary] = useState<WeightProgressSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsData, summaryData] = await Promise.all([
        getWeightLogs(),
        getWeightSummary(),
      ]);
      // Sort logs chronologically for chart rendering (oldest first)
      const sorted = [...logsData].sort(
        (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
      );
      setLogs(sorted);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load weight data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { logs, summary, loading, error, refresh: fetch };
}
