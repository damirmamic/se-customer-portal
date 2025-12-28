import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/backend/client';
import { useToast } from '@/hooks/use-toast';

export interface AzureResource {
  id: string;
  name: string;
  type: 'vm' | 'database' | 'storage' | 'cdn' | 'container';
  azureType: string;
  region: string;
  status: 'healthy' | 'warning' | 'critical' | 'degraded' | 'maintenance';
  uptime: number | null;
  cpu?: number;
  memory?: number;
  subscription: string;
  tags?: Record<string, string>;
}

export interface AzureAlert {
  id: string;
  name: string;
  severity: string;
  state: string;
  condition: string;
  resource: string;
  description?: string;
  firedAt?: string;
}

export interface AzureSubscription {
  subscriptionId: string;
  displayName: string;
  state: string;
}

export interface DashboardSummary {
  totalResources: number;
  healthyResources: number;
  activeIncidents: number;
  criticalIncidents: number;
  resourcesByType: Record<string, number>;
  alerts: AzureAlert[];
}

export interface LogQueryResult {
  tables: Array<{
    name: string;
    columns: Array<{ name: string; type: string }>;
    rows: any[][];
  }>;
}

export function useAzureMonitor() {
  const [subscriptions, setSubscriptions] = useState<AzureSubscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [resources, setResources] = useState<AzureResource[]>([]);
  const [alerts, setAlerts] = useState<AzureAlert[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const callAzureMonitor = useCallback(async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke('azure-monitor', {
      body: { action, ...params },
    });

    if (error) {
      console.error('Azure Monitor error:', error);
      throw new Error(error.message || 'Failed to call Azure Monitor');
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await callAzureMonitor('list-subscriptions');
      setSubscriptions(data.subscriptions || []);
      
      // Auto-select first subscription if available
      if (data.subscriptions?.length > 0 && !selectedSubscription) {
        setSelectedSubscription(data.subscriptions[0].subscriptionId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subscriptions';
      setError(message);
      toast({
        title: 'Error fetching subscriptions',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [callAzureMonitor, selectedSubscription, toast]);

  const fetchResources = useCallback(async (subscriptionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await callAzureMonitor('list-resources', { subscriptionId });
      setResources(data.resources || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch resources';
      setError(message);
      toast({
        title: 'Error fetching resources',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [callAzureMonitor, toast]);

  const fetchAlerts = useCallback(async (subscriptionId: string) => {
    try {
      const data = await callAzureMonitor('get-alerts', { subscriptionId });
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, [callAzureMonitor]);

  const fetchDashboardSummary = useCallback(async (subscriptionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await callAzureMonitor('get-dashboard-summary', { subscriptionId });
      setSummary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard summary';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [callAzureMonitor]);

  const queryLogs = useCallback(async (workspaceId: string, query: string): Promise<LogQueryResult | null> => {
    try {
      const data = await callAzureMonitor('query-logs', { workspaceId, query });
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to query logs';
      toast({
        title: 'Log query failed',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  }, [callAzureMonitor, toast]);

  const getResourceMetrics = useCallback(async (resourceId: string) => {
    try {
      const data = await callAzureMonitor('get-metrics', { resourceId });
      return data;
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      return null;
    }
  }, [callAzureMonitor]);

  const refresh = useCallback(async () => {
    if (selectedSubscription) {
      await Promise.all([
        fetchResources(selectedSubscription),
        fetchAlerts(selectedSubscription),
        fetchDashboardSummary(selectedSubscription),
      ]);
    }
  }, [selectedSubscription, fetchResources, fetchAlerts, fetchDashboardSummary]);

  // Auto-fetch subscriptions on mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Fetch resources when subscription changes
  useEffect(() => {
    if (selectedSubscription) {
      refresh();
    }
  }, [selectedSubscription]);

  return {
    subscriptions,
    selectedSubscription,
    setSelectedSubscription,
    resources,
    alerts,
    summary,
    loading,
    error,
    fetchSubscriptions,
    fetchResources,
    fetchAlerts,
    fetchDashboardSummary,
    queryLogs,
    getResourceMetrics,
    refresh,
  };
}
