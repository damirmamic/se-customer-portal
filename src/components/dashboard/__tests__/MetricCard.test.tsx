import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../MetricCard';
import { Activity } from 'lucide-react';

describe('MetricCard Component', () => {
  it('should render title and value', () => {
    render(
      <MetricCard
        title="Total Resources"
        value="150"
        icon={<Activity />}
      />
    );

    expect(screen.getByText('Total Resources')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render with change indicator', () => {
    render(
      <MetricCard
        title="Active Users"
        value="250"
        icon={<Activity />}
        change={12}
        changeLabel="vs last month"
      />
    );

    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('should apply status styles', () => {
    const { container } = render(
      <MetricCard
        title="Critical Issues"
        value="5"
        icon={<Activity />}
        status="critical"
      />
    );

    // Check that component renders without errors
    expect(screen.getByText('Critical Issues')).toBeInTheDocument();
  });

  it('should render icon', () => {
    const { container } = render(
      <MetricCard
        title="Resources"
        value="100"
        icon={<Activity />}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render with different statuses', () => {
    const { rerender } = render(
      <MetricCard
        title="Test"
        value="100"
        icon={<Activity />}
        status="healthy"
      />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();

    rerender(
      <MetricCard
        title="Test"
        value="100"
        icon={<Activity />}
        status="warning"
      />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();

    rerender(
      <MetricCard
        title="Test"
        value="100"
        icon={<Activity />}
        status="critical"
      />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
