import { useState, useCallback, useEffect } from 'react';
import { getCoachTrainees } from '../api/coaching';
import { CoachTraineeLinkResponse } from '../types/coaching';

interface UseCoachTraineesResult {
  trainees: CoachTraineeLinkResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCoachTrainees(): UseCoachTraineesResult {
  const [trainees, setTrainees] = useState<CoachTraineeLinkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCoachTrainees();
      setTrainees(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load trainees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { trainees, loading, error, refresh: fetch };
}
