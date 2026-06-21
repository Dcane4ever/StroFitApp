import { useState, useEffect, useCallback } from 'react';
import { getDiaryByDate } from '../api/diary';
import { DiaryDayResponse } from '../types/diary';

interface UseDiaryDayResult {
  data: DiaryDayResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDiaryDay(date: string): UseDiaryDayResult {
  const [data, setData] = useState<DiaryDayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDiaryByDate(date);
      setData(result);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load diary');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
