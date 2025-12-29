import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../useAuth';
import { supabase } from '@/integrations/backend/client';

// Mock Supabase
vi.mock('@/integrations/backend/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should initialize with no user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.roles).toEqual([]);
  });

  it('should set user when session exists', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      created_at: '2024-01-01',
    };

    const mockSession = {
      access_token: 'token',
      user: mockUser,
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ role: 'admin' }],
          error: null,
        })),
      })),
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await waitFor(() => {
      expect(result.current.roles).toContain('admin');
    });
  });

  it('should check roles correctly', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [
            { role: 'customer' },
            { role: 'operations_engineer' },
          ],
          error: null,
        })),
      })),
    } as any);

    const mockUser = { id: 'user-123', email: 'test@example.com' } as any;
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } as any },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.roles).toContain('operations_engineer');
    });

    expect(result.current.hasRole('customer')).toBe(true);
    expect(result.current.hasRole('operations_engineer')).toBe(true);
    expect(result.current.hasRole('admin')).toBe(false);
    expect(result.current.isOperationsEngineer).toBe(true);
    expect(result.current.isCustomer).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('should handle sign out', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should update roles when user changes', async () => {
    let authCallback: Function | null = null;

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authCallback = callback;
      return {
        data: { 
          subscription: { 
            id: 'test-subscription',
            callback,
            unsubscribe: vi.fn() 
          } 
        },
      };
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate auth state change
    const newUser = { id: 'new-user', email: 'new@example.com' } as any;
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ role: 'admin' }],
          error: null,
        })),
      })),
    } as any);

    if (authCallback) {
      await act(async () => {
        authCallback('SIGNED_IN', { user: newUser, access_token: 'token' });
      });
    }

    await waitFor(() => {
      expect(result.current.user?.id).toBe('new-user');
    }, { timeout: 1000 });
  });
});
