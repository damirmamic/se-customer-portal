import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('should render healthy status', () => {
    render(<StatusBadge status="healthy" />);
    
    const badge = screen.getByText('Healthy');
    expect(badge).toBeInTheDocument();
  });

  it('should render warning status', () => {
    render(<StatusBadge status="warning" />);
    
    const badge = screen.getByText('Warning');
    expect(badge).toBeInTheDocument();
  });

  it('should render critical status', () => {
    render(<StatusBadge status="critical" />);
    
    const badge = screen.getByText('Critical');
    expect(badge).toBeInTheDocument();
  });

  it('should render degraded status', () => {
    render(<StatusBadge status="degraded" />);
    
    const badge = screen.getByText('Degraded');
    expect(badge).toBeInTheDocument();
  });

  it('should render maintenance status', () => {
    render(<StatusBadge status="maintenance" />);
    
    const badge = screen.getByText('Maintenance');
    expect(badge).toBeInTheDocument();
  });

  it('should apply correct status classes', () => {
    const { container, rerender } = render(<StatusBadge status="healthy" />);
    const healthyBadge = container.querySelector('.status-healthy');
    expect(healthyBadge).toBeTruthy();

    rerender(<StatusBadge status="critical" />);
    const criticalBadge = container.querySelector('.status-critical');
    expect(criticalBadge).toBeTruthy();

    rerender(<StatusBadge status="warning" />);
    const warningBadge = container.querySelector('.status-warning');
    expect(warningBadge).toBeTruthy();
  });

  it('should capitalize status text', () => {
    render(<StatusBadge status="healthy" />);
    
    // Should display "Healthy" not "healthy"
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.queryByText('healthy')).not.toBeInTheDocument();
  });
});
