import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/testUtils';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProtectedRoute Component', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' } as any,
      session: {} as any,
      roles: ['customer'],
      loading: false,
      signOut: vi.fn(),
      hasRole: vi.fn(() => true),
      isOperationsEngineer: false,
      isAdmin: false,
      isCustomer: true,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading state while checking authentication', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      roles: [],
      loading: true,
      signOut: vi.fn(),
      hasRole: vi.fn(() => false),
      isOperationsEngineer: false,
      isAdmin: false,
      isCustomer: false,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should redirect to /auth when user is not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      roles: [],
      loading: false,
      signOut: vi.fn(),
      hasRole: vi.fn(() => false),
      isOperationsEngineer: false,
      isAdmin: false,
      isCustomer: false,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  it('should check required roles', () => {
    const hasRoleMock = vi.fn((role: string) => role === 'customer');
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' } as any,
      session: {} as any,
      roles: ['customer'],
      loading: false,
      signOut: vi.fn(),
      hasRole: hasRoleMock,
      isOperationsEngineer: false,
      isAdmin: false,
      isCustomer: true,
    });

    render(
      <ProtectedRoute requiredRoles={['customer']}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(hasRoleMock).toHaveBeenCalledWith('customer');
  });

  it('should deny access when user lacks required role', async () => {
    const hasRoleMock = vi.fn(() => false);
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' } as any,
      session: {} as any,
      roles: ['customer'],
      loading: false,
      signOut: vi.fn(),
      hasRole: hasRoleMock,
      isOperationsEngineer: false,
      isAdmin: false,
      isCustomer: true,
    });

    render(
      <ProtectedRoute requiredRoles={['admin']}>
        <TestComponent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('should allow access when user has one of multiple required roles', () => {
    const hasRoleMock = vi.fn((role: string) => 
      role === 'operations_engineer' || role === 'admin'
    );
    
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' } as any,
      session: {} as any,
      roles: ['operations_engineer'],
      loading: false,
      signOut: vi.fn(),
      hasRole: hasRoleMock,
      isOperationsEngineer: true,
      isAdmin: false,
      isCustomer: false,
    });

    render(
      <ProtectedRoute requiredRoles={['operations_engineer', 'admin']}>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
