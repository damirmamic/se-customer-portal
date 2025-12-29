import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the StatusBadge component to avoid import issues
vi.mock('../StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  ),
}));

// Mock the Progress component
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value}>{value}%</div>
  ),
}));

import { ResourceCard } from '../ResourceCard';

describe('ResourceCard Component', () => {
  const mockResourceProps = {
    name: 'test-vm',
    type: 'vm' as const,
    status: 'healthy' as const,
    region: 'eastus',
    uptime: 99.9,
    cpu: 45,
    memory: 60,
    subscription: 'sub-1',
  };

  it('should render resource information', () => {
    render(<ResourceCard {...mockResourceProps} />);

    expect(screen.getByText('test-vm')).toBeInTheDocument();
    expect(screen.getByText('eastus')).toBeInTheDocument();
  });

  it('should display resource status', () => {
    render(<ResourceCard {...mockResourceProps} />);

    expect(screen.getByTestId('status-badge')).toHaveTextContent('Healthy');
  });

  it('should show uptime when available', () => {
    render(<ResourceCard {...mockResourceProps} />);

    expect(screen.getByText(/99\.9%/)).toBeInTheDocument();
  });

  it('should display CPU and memory metrics when available', () => {
    render(<ResourceCard {...mockResourceProps} />);

    expect(screen.getAllByText(/45%/)[0]).toBeInTheDocument(); // CPU
    expect(screen.getAllByText(/60%/)[0]).toBeInTheDocument(); // Memory
  });

  it('should handle missing optional fields', () => {
    const minimalProps = {
      name: 'storage-account',
      type: 'storage' as const,
      status: 'healthy' as const,
      region: 'westus',
      uptime: null,
      subscription: 'sub-1',
    };

    render(<ResourceCard {...minimalProps} />);

    expect(screen.getByText('storage-account')).toBeInTheDocument();
    expect(screen.queryByText(/CPU/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Memory/)).not.toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument(); // For null uptime
  });

  it('should display different statuses', () => {
    const { rerender } = render(<ResourceCard {...mockResourceProps} status="critical" />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Critical');

    rerender(<ResourceCard {...mockResourceProps} status="warning" />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Warning');

    rerender(<ResourceCard {...mockResourceProps} status="degraded" />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Degraded');
  });

  it('should display subscription', () => {
    render(<ResourceCard {...mockResourceProps} />);
    expect(screen.getByText('sub-1')).toBeInTheDocument();
  });
});
