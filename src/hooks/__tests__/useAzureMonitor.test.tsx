import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
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
const mockToast = vi.fn();
vi.mock('../use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
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
    vi.resetAllMocks();
    
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  it('should initialize with default values', async () => {
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
    
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('should fetch subscriptions successfully', async () => {
    const mockSubscriptions = [
      { subscriptionId: 'sub1', displayName: 'Sub 1', state: 'Enabled' },
      { subscriptionId: 'sub2', displayName: 'Sub 2', state: 'Enabled' },
    ];

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { subscriptions: mockSubscriptions },
      error: null,
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });

    await waitFor(() => {
      expect(result.current.subscriptions).toEqual(mockSubscriptions);
    });
    
    // Should auto-select first subscription
    expect(result.current.selectedSubscription).toBe('sub1');
  });

  it('should handle subscription fetch error', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch' },
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch');
    }, { timeout: 8000 });
    
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'destructive',
      title: 'Error fetching subscriptions',
    }));
  });

  it('should fetch resources when subscription is selected', async () => {
    const mockSubscriptions = [
      { subscriptionId: 'sub1', displayName: 'Sub 1', state: 'Enabled' },
    ];
    const mockResources = [
      { id: 'res1', name: 'Resource 1', type: 'vm' },
    ];

    vi.mocked(supabase.functions.invoke).mockImplementation(async (functionName, options: any) => {
        const body = options?.body;
        if (body?.action === 'list-subscriptions') {
            return { data: { subscriptions: mockSubscriptions }, error: null };
        }
        if (body?.action === 'list-resources') {
            return { data: { resources: mockResources }, error: null };
        }
        if (body?.action === 'get-alerts') {
            return { data: { alerts: [] }, error: null };
        }
        if (body?.action === 'get-dashboard-summary') {
            return { data: { totalResources: 1 }, error: null };
        }
        return { data: {}, error: null };
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });

    await waitFor(() => {
      expect(result.current.subscriptions).toEqual(mockSubscriptions);
    });

    await waitFor(() => {
      expect(result.current.resources).toEqual(mockResources);
    });
  });

  it('should retry failed requests', async () => {
    // Mock subscriptions fetch to succeed immediately
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { subscriptions: [] },
      error: null,
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });
    
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Reset mocks to clear the subscription call
    vi.clearAllMocks();

    // Now test a manual call that fails then succeeds
    let callCount = 0;
    vi.mocked(supabase.functions.invoke).mockImplementation(async () => {
        callCount++;
        if (callCount <= 2) {
            return { data: null, error: { message: 'Temporary error' } };
        }
        return { data: { resources: [] }, error: null };
    });

    await act(async () => {
      await result.current.fetchResources('sub1');
    });

    // 3 calls: 2 failures + 1 success
    expect(callCount).toBe(3);
  });

  it('should not retry on auth errors', async () => {
     // Mock subscriptions fetch
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { subscriptions: [] },
      error: null,
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Fail with auth error
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'unauthorized' },
    });

    await act(async () => {
      await result.current.fetchResources('sub1');
    });

    // Should only be called once (plus the initial subscription fetch, but we are checking calls since reset if we did reset)
    // But here we didn't reset.
    // The initial fetch was 1 call.
    // The fetchResources should be 1 call (no retry).
    // Total 2 calls.
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
    expect(result.current.error).toContain('unauthorized');
  });

  it('should query logs successfully', async () => {
    // Mock subscriptions fetch
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { subscriptions: [] },
      error: null,
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const mockLogResult = {
      tables: [{ name: 'PrimaryResult', columns: [], rows: [] }]
    };

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { result: mockLogResult },
      error: null,
    });

    let logResult;
    await act(async () => {
      logResult = await result.current.queryLogs('ws1', 'Heartbeat');
    });

    expect(logResult).toEqual(mockLogResult);
  });

  it('should handle log query error', async () => {
    // Mock subscriptions fetch
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { subscriptions: [] },
      error: null,
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'Query failed' },
    });

    let logResult;
    await act(async () => {
      logResult = await result.current.queryLogs('ws1', 'Heartbeat');
    });

    expect(logResult).toBeNull();
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      variant: 'destructive',
      title: 'Log query failed',
    }));
  });

  it('should get resource metrics successfully', async () => {
    // Mock subscriptions fetch
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { subscriptions: [] },
      error: null,
    });

    const { result } = renderHook(() => useAzureMonitor(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const mockMetrics = { value: [] };

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: mockMetrics,
      error: null,
    });

    let metrics;
    await act(async () => {
      metrics = await result.current.getResourceMetrics('res1');
    });

    expect(metrics).toEqual(mockMetrics);
  });
});
