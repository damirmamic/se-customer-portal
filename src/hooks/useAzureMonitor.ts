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
    rows: unknown[][];
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

  const callAzureMonitor = useCallback(async (action: string, params: Record<string, unknown> = {}, retries = 3) => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('azure-monitor', {
          body: { action, ...params },
        });

        if (error) {
          console.error(`Azure Monitor error (attempt ${attempt + 1}/${retries}):`, error);
          lastError = new Error(error.message || 'Failed to call Azure Monitor');
          
          // If it's a credentials error, don't retry
          if (error.message?.includes('credentials') || error.message?.includes('unauthorized')) {
            throw lastError;
          }
          
          // Wait before retry (exponential backoff)
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          throw lastError;
        }

        if (data?.error) {
          lastError = new Error(data.error);
          
          // Don't retry for configuration errors
          if (data.error.includes('not configured') || data.error.includes('credentials')) {
            throw lastError;
          }
          
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          throw lastError;
        }

        return data;
      } catch (err) {
        if (err instanceof Error && (
          err.message.includes('credentials') || 
          err.message.includes('not configured') ||
          err.message.includes('unauthorized')
        )) {
          throw err; // Don't retry config errors
        }
        
        lastError = err instanceof Error ? err : new Error('Unknown error');
        if (attempt === retries - 1) {
          throw lastError;
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError || new Error('Failed to call Azure Monitor after retries');
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
  }, [fetchSubscriptions]);

  // Fetch resources when subscription changes
  useEffect(() => {
    if (selectedSubscription) {
      refresh();
    }
  }, [selectedSubscription, refresh]);

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
