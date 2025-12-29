import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAzureMonitor } from '../useAzureMonitor';
import { supabase } from '../../integrations/backend/client';

// Mock Supabase
vi.mock('../../integrations/backend/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock toast
vi.mock('../use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useAzureMonitor', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  it('should initialize with default values', () => {
    // Mock to prevent automatic fetch
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { subscriptions: [] },
      error: null,
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });

    // Check initial values
    expect(result.current.subscriptions).toEqual([]);
    expect(result.current.resources).toEqual([]);
    expect(result.current.alerts).toEqual([]);
    expect(result.current.summary).toBeNull();
  });

  it('should have correct initial state', () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { subscriptions: [] },
      error: null,
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });

    expect(result.current.selectedSubscription).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
