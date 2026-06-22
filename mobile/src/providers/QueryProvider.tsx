import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Retry only on network errors, not on 4xx responses from the backend
function shouldRetry(failureCount: number, error: any): boolean {
  if (failureCount >= 2) return false;
  const status: number | undefined = error?.status;
  // Never retry client errors (auth, validation, not-found)
  if (status != null && status >= 400 && status < 500) return false;
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Show cached data immediately, refetch in background
      staleTime: 30_000,           // 30 s before data is considered stale
      gcTime: 5 * 60 * 1000,       // 5 min before unused cache entries are GC'd
      retry: shouldRetry,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10_000),
      refetchOnWindowFocus: false, // React Native — not a browser; focus handled via useFocusEffect
    },
    mutations: {
      retry: false,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
