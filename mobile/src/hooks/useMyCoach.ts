import { useState, useCallback, useEffect } from 'react';
import { getMyCoach } from '../api/coaching';
import { TraineeCoachResponse } from '../types/coaching';

interface UseMyCoachResult {
  coach: TraineeCoachResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMyCoach(): UseMyCoachResult {
  const [coach, setCoach] = useState<TraineeCoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyCoach();
      setCoach(data); // null = no coach linked
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load coach info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { coach, loading, error, refresh: fetch };
}
