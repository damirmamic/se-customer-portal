import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AzureTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface MetricValue {
  timeStamp: string;
  average?: number;
  total?: number;
  minimum?: number;
  maximum?: number;
}

interface AzureMetric {
  name: { value: string; localizedValue: string };
  timeseries: Array<{ data: MetricValue[] }>;
}

interface AzureResource {
  id: string;
  name: string;
  type: string;
  location: string;
  tags?: Record<string, string>;
}

interface AzureAlert {
  id: string;
  name: string;
  properties: {
    severity: string;
    monitorCondition: string;
    alertState: string;
    targetResource: string;
    description?: string;
    signalType?: string;
    firedDateTime?: string;
  };
}

// Get access token using client credentials flow
async function getAzureToken(scope: string): Promise<string> {
  const clientId = Deno.env.get('AZURE_CLIENT_ID');
  const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET');
  const tenantId = Deno.env.get('AZURE_TENANT_ID');

  if (!clientId || !clientSecret || !tenantId) {
    throw new Error('Azure credentials not configured');
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Azure token error:', error);
    throw new Error('Failed to get Azure access token');
  }

  const data: AzureTokenResponse = await response.json();
  return data.access_token;
}

// List Azure subscriptions
async function listSubscriptions(token: string): Promise<any[]> {
  const response = await fetch(
    'https://management.azure.com/subscriptions?api-version=2022-12-01',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Azure Management API list-subscriptions failed (${response.status}): ${details}`
    );
  }

  const data = await response.json();
  return data.value || [];
}

// List resources in a subscription
async function listResources(token: string, subscriptionId: string): Promise<AzureResource[]> {
  const response = await fetch(
    `https://management.azure.com/subscriptions/${subscriptionId}/resources?api-version=2021-04-01`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Azure Management API list-resources failed (${response.status}): ${details}`
    );
  }

  const data = await response.json();
  return data.value || [];
}

// Get metrics for a resource with time-series data
async function getResourceMetrics(
  token: string,
  resourceId: string,
  metricNames: string[],
  timespan: string = 'PT1H',
  interval: string = 'PT5M'
): Promise<AzureMetric[]> {
  const metricsQuery = metricNames.join(',');
  const url = `https://management.azure.com${resourceId}/providers/microsoft.insights/metrics?api-version=2021-05-01&metricnames=${metricsQuery}&timespan=${timespan}&interval=${interval}&aggregation=Average`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const details = await response.text();
    console.log(`Metrics API error for ${resourceId}:`, details);
    return [];
  }

  const data = await response.json();
  return data.value || [];
}

// Get resource availability/uptime from Azure Monitor
async function getResourceAvailability(
  token: string,
  resourceId: string
): Promise<number | null> {
  try {
    // Try to get availability metric (different names for different resource types)
    const availabilityMetrics = ['Availability', 'availability', 'HealthProbeCount', 'Http2xx'];
    const url = `https://management.azure.com${resourceId}/providers/microsoft.insights/metrics?api-version=2021-05-01&metricnames=${availabilityMetrics.join(',')}&timespan=P7D&interval=P1D&aggregation=Average`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const metrics = data.value || [];
    
    for (const metric of metrics) {
      const timeseries = metric.timeseries?.[0]?.data || [];
      if (timeseries.length > 0) {
        const values = timeseries.filter((d: MetricValue) => d.average !== undefined).map((d: MetricValue) => d.average!);
        if (values.length > 0) {
          return Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length * 100) / 100;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Get alerts from Azure Monitor
async function getAlerts(token: string, subscriptionId: string): Promise<AzureAlert[]> {
  const response = await fetch(
    `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.AlertsManagement/alerts?api-version=2019-05-05-preview`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Azure Management API get-alerts failed (${response.status}): ${details}`
    );
  }

  const data = await response.json();
  return data.value || [];
}

// Query Log Analytics workspace
async function queryLogAnalytics(
  token: string,
  workspaceId: string,
  query: string
): Promise<any> {
  const response = await fetch(
    `https://api.loganalytics.io/v1/workspaces/${workspaceId}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Azure Log Analytics query failed (${response.status}): ${details}`);
  }

  return await response.json();
}

// Map Azure resource type to our dashboard type
function mapResourceType(azureType: string): string {
  const typeMap: Record<string, string> = {
    'microsoft.compute/virtualmachines': 'vm',
    'microsoft.sql/servers': 'database',
    'microsoft.sql/servers/databases': 'database',
    'microsoft.dbformysql/servers': 'database',
    'microsoft.dbforpostgresql/servers': 'database',
    'microsoft.documentdb/databaseaccounts': 'database',
    'microsoft.storage/storageaccounts': 'storage',
    'microsoft.cdn/profiles': 'cdn',
    'microsoft.cdn/profiles/endpoints': 'cdn',
    'microsoft.containerservice/managedclusters': 'container',
    'microsoft.web/sites': 'container',
    'microsoft.containerinstances/containergroups': 'container',
  };
  return typeMap[azureType.toLowerCase()] || 'vm';
}

// Get metric names for resource type
function getMetricNamesForType(resourceType: string): string[] {
  const metricMap: Record<string, string[]> = {
    'microsoft.compute/virtualmachines': ['Percentage CPU', 'Available Memory Bytes'],
    'microsoft.sql/servers/databases': ['cpu_percent', 'physical_data_read_percent'],
    'microsoft.web/sites': ['CpuPercentage', 'MemoryPercentage'],
    'microsoft.containerservice/managedclusters': ['node_cpu_usage_percentage', 'node_memory_rss_percentage'],
    'microsoft.storage/storageaccounts': ['UsedCapacity', 'Availability'],
  };
  return metricMap[resourceType.toLowerCase()] || [];
}

// Get unit for metric display
function getMetricUnit(metricName: string): string {
  const name = metricName.toLowerCase();
  if (name.includes('percent') || name.includes('cpu')) return '%';
  if (name.includes('bytes')) return 'bytes';
  if (name.includes('count')) return 'count';
  if (name.includes('seconds')) return 'sec';
  if (name.includes('milliseconds')) return 'ms';
  return '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, subscriptionId, resourceId, workspaceId, query } = await req.json();
    
    console.log('Azure Monitor action:', action);

    // Get token for Azure Management API
    const managementToken = await getAzureToken('https://management.azure.com/.default');

    if (action === 'list-subscriptions') {
      const subscriptions = await listSubscriptions(managementToken);
      return new Response(
        JSON.stringify({ subscriptions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list-resources') {
      if (!subscriptionId) {
        return new Response(
          JSON.stringify({ error: 'subscriptionId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const [resources, alerts] = await Promise.all([
        listResources(managementToken, subscriptionId),
        getAlerts(managementToken, subscriptionId),
      ]);

      const activeAlerts = alerts.filter(
        (a) =>
          a.properties.alertState === 'New' || a.properties.alertState === 'Acknowledged'
      );

      const severityRank: Record<string, number> = {
        Sev0: 3,
        Sev1: 3,
        Sev2: 2,
        Sev3: 1,
        Sev4: 0,
      };

      const statusForRank = (rank: number) => {
        if (rank >= 3) return 'critical';
        if (rank >= 2) return 'warning';
        return 'healthy';
      };

      const alertRankByResourceId = new Map<string, number>();
      for (const alert of activeAlerts) {
        const target = alert.properties.targetResource;
        if (!target) continue;
        const rank = severityRank[alert.properties.severity] ?? 1;
        const prev = alertRankByResourceId.get(target) ?? -1;
        if (rank > prev) alertRankByResourceId.set(target, rank);
      }

      // Map resources to our dashboard format
      const mappedResources = await Promise.all(
        resources.slice(0, 20).map(async (resource) => {
          const metricNames = getMetricNamesForType(resource.type);
          let cpu: number | undefined;
          let memory: number | undefined;

          if (metricNames.length > 0) {
            try {
              const metrics = await getResourceMetrics(managementToken, resource.id, metricNames);
              for (const metric of metrics) {
                const latestData = metric.timeseries?.[0]?.data?.slice(-1)[0];
                if (latestData?.average !== undefined) {
                  const metricName = metric.name.value.toLowerCase();

                  if (metricName.includes('cpu')) {
                    cpu = Math.round(latestData.average);
                  }

                  if (metricName.includes('memory') && !metricName.includes('bytes')) {
                    memory = Math.round(latestData.average);
                  }
                }
              }
            } catch {
              // ignore per-resource metric errors
            }
          }

          const statusRank = alertRankByResourceId.get(resource.id);
          
          // Try to get availability for this resource
          let uptime: number | null = null;
          try {
            uptime = await getResourceAvailability(managementToken, resource.id);
          } catch {
            // Ignore availability fetch errors
          }

          return {
            id: resource.id,
            name: resource.name,
            type: mapResourceType(resource.type),
            azureType: resource.type,
            region: resource.location,
            status: statusForRank(statusRank ?? 0),
            uptime,
            cpu,
            memory,
            subscription: subscriptionId,
            tags: resource.tags,
          };
        })
      );

      return new Response(
        JSON.stringify({ resources: mappedResources }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-alerts') {
      if (!subscriptionId) {
        return new Response(
          JSON.stringify({ error: 'subscriptionId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const alerts = await getAlerts(managementToken, subscriptionId);
      
      const mappedAlerts = alerts.map((alert) => ({
        id: alert.id,
        name: alert.name,
        severity: alert.properties.severity,
        state: alert.properties.alertState,
        condition: alert.properties.monitorCondition,
        resource: alert.properties.targetResource,
        description: alert.properties.description,
        firedAt: alert.properties.firedDateTime,
      }));

      return new Response(
        JSON.stringify({ alerts: mappedAlerts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-metrics') {
      if (!resourceId) {
        return new Response(
          JSON.stringify({ error: 'resourceId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract resource type from resource ID
      const resourceTypeParts = resourceId.split('/providers/');
      let resourceType = '';
      if (resourceTypeParts.length > 1) {
        const typePart = resourceTypeParts[resourceTypeParts.length - 1];
        const parts = typePart.split('/');
        if (parts.length >= 2) {
          resourceType = `${parts[0]}/${parts[1]}`;
        }
      }

      const metricNames = getMetricNamesForType(resourceType);
      const defaultMetrics = ['Percentage CPU', 'Available Memory Bytes', 'Network In Total', 'Network Out Total'];
      const metricsToFetch = metricNames.length > 0 ? metricNames : defaultMetrics;
      
      console.log(`Fetching metrics for ${resourceType}:`, metricsToFetch);
      
      const rawMetrics = await getResourceMetrics(managementToken, resourceId, metricsToFetch, 'PT6H', 'PT5M');

      // Transform to time-series format for charts
      const formattedMetrics = rawMetrics.map(metric => {
        const timeseries = metric.timeseries?.[0]?.data || [];
        return {
          name: metric.name.localizedValue || metric.name.value,
          unit: getMetricUnit(metric.name.value),
          data: timeseries.map((point: MetricValue) => ({
            timestamp: point.timeStamp,
            value: point.average ?? point.total ?? point.maximum ?? 0,
          })),
          currentValue: timeseries.length > 0 
            ? (timeseries[timeseries.length - 1].average ?? timeseries[timeseries.length - 1].total ?? 0)
            : null,
        };
      });

      return new Response(
        JSON.stringify({ metrics: formattedMetrics }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'query-logs') {
      if (!workspaceId || !query) {
        return new Response(
          JSON.stringify({ error: 'workspaceId and query are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get token for Log Analytics API
      const logToken = await getAzureToken('https://api.loganalytics.io/.default');
      const result = await queryLogAnalytics(logToken, workspaceId, query);

      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-dashboard-summary') {
      if (!subscriptionId) {
        return new Response(
          JSON.stringify({ error: 'subscriptionId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch resources and alerts in parallel
      const [resources, alerts] = await Promise.all([
        listResources(managementToken, subscriptionId),
        getAlerts(managementToken, subscriptionId),
      ]);

      const activeAlerts = alerts.filter(a => a.properties.alertState === 'New' || a.properties.alertState === 'Acknowledged');
      const criticalAlerts = activeAlerts.filter(a => a.properties.severity === 'Sev0' || a.properties.severity === 'Sev1');

      const summary = {
        totalResources: resources.length,
        activeIncidents: activeAlerts.length,
        criticalIncidents: criticalAlerts.length,
        resourcesByType: resources.reduce((acc, r) => {
          const type = mapResourceType(r.type);
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        alerts: activeAlerts.slice(0, 10).map(alert => ({
          id: alert.id,
          name: alert.name,
          severity: alert.properties.severity,
          state: alert.properties.alertState,
          resource: alert.properties.targetResource?.split('/').pop(),
          firedAt: alert.properties.firedDateTime,
        })),
      };

      return new Response(
        JSON.stringify(summary),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in azure-monitor function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
