import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ========== CORS Configuration ==========
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8080',
];

const FALLBACK_ORIGIN = 'https://rdzwqkklwyuonjqwiczh.lovableproject.com';

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;

  try {
    const url = new URL(origin);
    return (
      url.protocol === 'https:' &&
      (url.hostname.endsWith('.lovable.app') || url.hostname.endsWith('.lovableproject.com'))
    );
  } catch {
    return false;
  }
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : FALLBACK_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// ========== Role Verification ==========
type AppRole = 'customer' | 'operations_engineer' | 'admin';

async function verifyUserRole(req: Request, requiredRoles: AppRole[]): Promise<{ authorized: boolean; userId?: string; userRoles?: AppRole[] }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    console.log('No authorization header found');
    return { authorized: false };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Use anon key to verify the user's JWT
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
  if (userError || !user) {
    console.log('Failed to get user from token:', userError?.message);
    return { authorized: false };
  }

  // Use service role to query user_roles (bypasses RLS)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: roles, error: rolesError } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (rolesError) {
    console.log('Failed to fetch user roles:', rolesError.message);
    return { authorized: false };
  }

  const userRoles = roles?.map(r => r.role as AppRole) || [];
  const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role));

  console.log(`User ${user.id} has roles: ${userRoles.join(', ')}. Required: ${requiredRoles.join(', ')}. Authorized: ${hasRequiredRole}`);

  return { 
    authorized: hasRequiredRole, 
    userId: user.id,
    userRoles 
  };
}

// ========== Input Validation ==========

// Azure Subscription ID must be a valid UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Azure Resource ID pattern: /subscriptions/{subId}/resourceGroups/{rgName}/providers/{provider}/{type}/{name}
// Must start with /subscriptions/ and contain only allowed characters
const RESOURCE_ID_REGEX = /^\/subscriptions\/[0-9a-f-]+\/resourceGroups\/[a-zA-Z0-9_.-]+\/providers\/[a-zA-Z0-9._/-]+$/i;

// Workspace ID (Log Analytics) - typically a UUID
const WORKSPACE_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// KQL query validation - block dangerous patterns
const DANGEROUS_KQL_PATTERNS = [
  /\bexternaldata\b/i,      // Can read external data
  /\bexternaltable\b/i,     // Can reference external tables  
  /\bmaterialize\b/i,       // Can cause resource exhaustion
  /\binvoke\b/i,            // Can invoke functions
  /\bevaluate\b.*\bhttp/i,  // HTTP calls
];

const MAX_QUERY_LENGTH = 5000;

function validateSubscriptionId(subscriptionId: string): void {
  if (!subscriptionId || typeof subscriptionId !== 'string') {
    throw new Error('Subscription ID is required');
  }
  if (!UUID_REGEX.test(subscriptionId)) {
    throw new Error('Invalid subscription ID format');
  }
}

function validateResourceId(resourceId: string): void {
  if (!resourceId || typeof resourceId !== 'string') {
    throw new Error('Resource ID is required');
  }
  if (resourceId.length > 1000) {
    throw new Error('Resource ID exceeds maximum length');
  }
  if (!RESOURCE_ID_REGEX.test(resourceId)) {
    throw new Error('Invalid resource ID format');
  }
}

function validateWorkspaceId(workspaceId: string): void {
  if (!workspaceId || typeof workspaceId !== 'string') {
    throw new Error('Workspace ID is required');
  }
  if (!WORKSPACE_ID_REGEX.test(workspaceId)) {
    throw new Error('Invalid workspace ID format');
  }
}

function validateKqlQuery(query: string): void {
  if (!query || typeof query !== 'string') {
    throw new Error('Query is required');
  }
  if (query.length > MAX_QUERY_LENGTH) {
    throw new Error('Query exceeds maximum length');
  }
  for (const pattern of DANGEROUS_KQL_PATTERNS) {
    if (pattern.test(query)) {
      throw new Error('Query contains disallowed patterns');
    }
  }
}

const VALID_ACTIONS = [
  'list-subscriptions',
  'list-resources',
  'get-alerts',
  'get-metrics',
  'query-logs',
  'get-dashboard-summary',
];

function validateAction(action: unknown): asserts action is string {
  if (!action || typeof action !== 'string') {
    throw new Error('Action is required');
  }
  if (!VALID_ACTIONS.includes(action)) {
    throw new Error('Invalid action');
  }
}

// ========== Interfaces ==========

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
    throw new Error('Failed to authenticate with Azure');
  }

  const data: AzureTokenResponse = await response.json();
  return data.access_token;
}

// List Azure subscriptions
async function listSubscriptions(token: string): Promise<unknown[]> {
  const response = await fetch(
    'https://management.azure.com/subscriptions?api-version=2022-12-01',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const details = await response.text();
    console.error('Azure subscriptions API error:', details);
    throw new Error('Failed to fetch Azure subscriptions');
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
    console.error('Azure resources API error:', details);
    throw new Error('Failed to fetch Azure resources');
  }

  const data = await response.json();
  return data.value || [];
}

// Parse simple ISO8601 durations used in this project (e.g. PT6H, PT5M, P7D)
function durationToMs(duration: string): number | null {
  const d = duration.toUpperCase();

  // PnD
  const daysMatch = d.match(/^P(\d+)D$/);
  if (daysMatch) return Number(daysMatch[1]) * 24 * 60 * 60 * 1000;

  // PTnH
  const hoursMatch = d.match(/^PT(\d+)H$/);
  if (hoursMatch) return Number(hoursMatch[1]) * 60 * 60 * 1000;

  // PTnM
  const minutesMatch = d.match(/^PT(\d+)M$/);
  if (minutesMatch) return Number(minutesMatch[1]) * 60 * 1000;

  return null;
}

function toAzureTimespan(timespan: string): string {
  if (timespan.includes('/')) return timespan;

  const ms = durationToMs(timespan);
  if (!ms) return timespan;

  const end = new Date();
  const start = new Date(end.getTime() - ms);
  return `${start.toISOString()}/${end.toISOString()}`;
}

function extractCommonTimeGrain(details: string): string | null {
  const match = details.match(/Commonly allowed time grains:\s*([0-9]{2}:[0-9]{2}:[0-9]{2})/i);
  return match?.[1] ?? null;
}

function timeGrainToInterval(grain: string): string {
  const [hh, mm, ss] = grain.split(':').map(Number);
  const parts: string[] = [];
  if (hh) parts.push(`${hh}H`);
  if (mm) parts.push(`${mm}M`);
  if (ss) parts.push(`${ss}S`);
  return `PT${parts.join('') || '0M'}`;
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
  const timespanParam = encodeURIComponent(toAzureTimespan(timespan));
  const metricNamesParam = encodeURIComponent(metricsQuery);

  const makeUrl = (intervalValue: string) =>
    `https://management.azure.com${resourceId}/providers/microsoft.insights/metrics?api-version=2021-05-01&metricnames=${metricNamesParam}&timespan=${timespanParam}&interval=${intervalValue}&aggregation=Average`;

  const fetchOnce = async (intervalValue: string) => {
    const res = await fetch(makeUrl(intervalValue), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const json = await res.json();
      return { ok: true as const, metrics: (json.value || []) as AzureMetric[] };
    }

    const details = await res.text();
    return { ok: false as const, status: res.status, details };
  };

  const first = await fetchOnce(interval);
  if (first.ok) return first.metrics;

  // Permission denied - log server-side, return generic error
  if (first.status === 401 || first.status === 403) {
    console.error(`Azure metrics permission denied for resource:`, first.details);
    throw new Error('Unable to fetch metrics. Check Azure permissions.');
  }

  // Retry with Azure's suggested common time grain (storage metrics often require PT1H)
  const common = extractCommonTimeGrain(first.details);
  if (common) {
    const retryInterval = timeGrainToInterval(common);
    if (retryInterval !== interval) {
      const second = await fetchOnce(retryInterval);
      if (second.ok) return second.metrics;
      console.error(`Metrics API retry error:`, second.details);
      return [];
    }
  }

  console.error(`Metrics API error:`, first.details);
  return [];
}

// Get resource availability/uptime from Azure Monitor
async function getResourceAvailability(
  token: string,
  resourceId: string
): Promise<number | null> {
  try {
    // Availability works for some services (e.g. Storage Accounts). If not supported, we'll return null.
    const metrics = await getResourceMetrics(
      token,
      resourceId,
      ['Availability'],
      'P7D',
      'PT1H'
    );

    const availabilityMetric = metrics.find((m) =>
      (m.name.value || '').toLowerCase().includes('availability')
    );

    const points = availabilityMetric?.timeseries?.[0]?.data ?? [];
    const values = points
      .map((p) => p.average)
      .filter((v): v is number => typeof v === 'number');

    if (values.length === 0) return null;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // Some availability metrics come as 0..1, others as 0..100
    const normalized = avg <= 1 ? avg * 100 : avg;

    return Math.round(normalized * 100) / 100;
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
    console.error('Azure alerts API error:', details);
    throw new Error('Failed to fetch Azure alerts');
  }

  const data = await response.json();
  return data.value || [];
}

// Query Log Analytics workspace
async function queryLogAnalytics(
  token: string,
  workspaceId: string,
  query: string
): Promise<unknown> {
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
    console.error('Log Analytics query error:', details);
    throw new Error('Failed to execute log query');
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

// Get metric names for resource type (expanded list)
function getMetricNamesForType(resourceType: string): string[] {
  const metricMap: Record<string, string[]> = {
    'microsoft.compute/virtualmachines': ['Percentage CPU', 'Available Memory Bytes', 'Network In Total', 'Network Out Total'],
    'microsoft.sql/servers/databases': ['cpu_percent', 'physical_data_read_percent', 'dtu_consumption_percent'],
    'microsoft.web/sites': ['CpuPercentage', 'MemoryPercentage', 'Requests', 'Http5xx'],
    'microsoft.containerservice/managedclusters': ['node_cpu_usage_percentage', 'node_memory_rss_percentage'],
    'microsoft.storage/storageaccounts': ['UsedCapacity', 'Transactions', 'Availability'],
    'microsoft.operationalinsights/workspaces': ['AvailabilityRate_Query', 'Ingestion Volume'],
    'microsoft.machinelearningservices/workspaces': ['Completed Runs', 'Failed Runs', 'CpuUtilization'],
    'microsoft.keyvault/vaults': ['ServiceApiHit', 'ServiceApiLatency', 'Availability'],
    'microsoft.network/loadbalancers': ['VipAvailability', 'DipAvailability'],
    'microsoft.network/applicationgateways': ['Throughput', 'HealthyHostCount', 'UnhealthyHostCount'],
    'microsoft.cache/redis': ['usedmemory', 'serverLoad', 'cacheHits', 'cacheMisses'],
    'microsoft.documentdb/databaseaccounts': ['TotalRequests', 'TotalRequestUnits', 'AvailableStorage'],
    'microsoft.servicebus/namespaces': ['IncomingMessages', 'OutgoingMessages', 'ActiveConnections'],
    'microsoft.eventhub/namespaces': ['IncomingMessages', 'OutgoingMessages', 'ThrottledRequests'],
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
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, subscriptionId, resourceId, workspaceId, query } = body;
    
    // Validate action
    validateAction(action);
    
    console.log('Azure Monitor action:', action);

    // Server-side role verification - require operations_engineer or admin role
    const { authorized, userId, userRoles } = await verifyUserRole(req, ['operations_engineer', 'admin']);
    if (!authorized) {
      console.log('Access denied: User lacks required role for azure-monitor');
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Operations Engineer or Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authorized user ${userId} with roles [${userRoles?.join(', ')}] accessing ${action}`);

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
      validateSubscriptionId(subscriptionId);

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
      validateSubscriptionId(subscriptionId);

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
      validateResourceId(resourceId);

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
      
      // If no known metrics for this type, return empty rather than fail
      if (metricNames.length === 0) {
        console.log(`No known metrics for resource type: ${resourceType}`);
        return new Response(
          JSON.stringify({ metrics: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Fetching metrics for ${resourceType}:`, metricNames);
      
      const rawMetrics = await getResourceMetrics(managementToken, resourceId, metricNames, 'PT6H', 'PT1H');

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
      validateWorkspaceId(workspaceId);
      validateKqlQuery(query);

      // Get token for Log Analytics API
      const logToken = await getAzureToken('https://api.loganalytics.io/.default');
      const result = await queryLogAnalytics(logToken, workspaceId, query);

      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-dashboard-summary') {
      validateSubscriptionId(subscriptionId);

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

    // This should never be reached due to validateAction, but kept for safety
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const corsHeaders = getCorsHeaders(req);
    console.error('Error in azure-monitor function:', error);
    // Return generic error message to client, log details server-side
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
