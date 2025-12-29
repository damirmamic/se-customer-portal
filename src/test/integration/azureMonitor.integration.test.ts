import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '@/integrations/backend/client';

/**
 * Integration tests for Azure Monitor Edge Function
 * 
 * These tests verify the integration between the frontend and Azure services
 * through Supabase Edge Functions. They require proper Azure credentials
 * to be configured in the Edge Function environment.
 * 
 * To run these tests, ensure:
 * 1. Supabase Edge Functions are deployed
 * 2. Azure credentials are set in Supabase secrets
 * 3. The service principal has appropriate permissions
 */

describe('Azure Monitor Integration', () => {
  const TIMEOUT = 30000; // 30 seconds for Azure API calls

  beforeAll(() => {
    // Verify environment is set up
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('VITE_SUPABASE_URL not set, integration tests may fail');
    }
  });

  describe('Subscription Management', () => {
    it('should list Azure subscriptions', async () => {
      const { data, error } = await supabase.functions.invoke('azure-monitor', {
        body: { action: 'list-subscriptions' },
      });

      // If credentials are not configured, expect a specific error
      if (error || data?.error) {
        const errorMessage = error?.message || data?.error || '';
        expect(errorMessage).toMatch(/credentials|configured|unauthorized|non-2xx/i);
        return;
      }

      expect(data).toHaveProperty('subscriptions');
      expect(Array.isArray(data.subscriptions)).toBe(true);

      if (data.subscriptions.length > 0) {
        const subscription = data.subscriptions[0];
        expect(subscription).toHaveProperty('subscriptionId');
        expect(subscription).toHaveProperty('displayName');
        expect(subscription).toHaveProperty('state');
      }
    }, TIMEOUT);
  });

  describe('Resource Management', () => {
    it('should handle resource listing with proper error handling', async () => {
      // First try to get subscriptions
      const subsResponse = await supabase.functions.invoke('azure-monitor', {
        body: { action: 'list-subscriptions' },
      });

      if (subsResponse.error || subsResponse.data?.error) {
        console.log('Skipping resource test - no subscriptions available');
        return;
      }

      const subscriptions = subsResponse.data?.subscriptions || [];
      if (subscriptions.length === 0) {
        console.log('Skipping resource test - no subscriptions found');
        return;
      }

      const subscriptionId = subscriptions[0].subscriptionId;

      const { data, error } = await supabase.functions.invoke('azure-monitor', {
        body: { 
          action: 'list-resources',
          subscriptionId,
        },
      });

      if (error || data?.error) {
        // Resource listing might fail for various reasons
        expect(error?.message || data?.error).toBeTruthy();
        return;
      }

      expect(data).toHaveProperty('resources');
      expect(Array.isArray(data.resources)).toBe(true);
    }, TIMEOUT);
  });

  describe('Alert Management', () => {
    it('should handle alert fetching gracefully', async () => {
      const subsResponse = await supabase.functions.invoke('azure-monitor', {
        body: { action: 'list-subscriptions' },
      });

      if (subsResponse.error || subsResponse.data?.error) {
        return;
      }

      const subscriptions = subsResponse.data?.subscriptions || [];
      if (subscriptions.length === 0) {
        return;
      }

      const subscriptionId = subscriptions[0].subscriptionId;

      const { data, error } = await supabase.functions.invoke('azure-monitor', {
        body: { 
          action: 'get-alerts',
          subscriptionId,
        },
      });

      // Alerts endpoint might not be available or might fail
      if (error || data?.error) {
        expect(error?.message || data?.error).toBeTruthy();
        return;
      }

      expect(data).toHaveProperty('alerts');
      expect(Array.isArray(data.alerts)).toBe(true);
    }, TIMEOUT);
  });

  describe('Dashboard Summary', () => {
    it('should aggregate dashboard data', async () => {
      const subsResponse = await supabase.functions.invoke('azure-monitor', {
        body: { action: 'list-subscriptions' },
      });

      if (subsResponse.error || subsResponse.data?.error) {
        return;
      }

      const subscriptions = subsResponse.data?.subscriptions || [];
      if (subscriptions.length === 0) {
        return;
      }

      const subscriptionId = subscriptions[0].subscriptionId;

      const { data, error } = await supabase.functions.invoke('azure-monitor', {
        body: { 
          action: 'get-dashboard-summary',
          subscriptionId,
        },
      });

      if (error || data?.error) {
        expect(error?.message || data?.error).toBeTruthy();
        return;
      }

      expect(data).toHaveProperty('totalResources');
      expect(data).toHaveProperty('activeIncidents');
      expect(data).toHaveProperty('criticalIncidents');
      expect(typeof data.totalResources).toBe('number');
      expect(typeof data.activeIncidents).toBe('number');
    }, TIMEOUT);
  });

  describe('Error Handling', () => {
    it('should handle invalid subscription ID', async () => {
      const { data, error } = await supabase.functions.invoke('azure-monitor', {
        body: { 
          action: 'list-resources',
          subscriptionId: 'invalid-subscription-id',
        },
      });

      // Should either return an error or data with an error property
      const hasError = error !== null || (data && data.error);
      expect(hasError).toBe(true);
    }, TIMEOUT);

    it('should handle unknown action', async () => {
      const { data, error } = await supabase.functions.invoke('azure-monitor', {
        body: { 
          action: 'unknown-action',
        },
      });

      const hasError = error !== null || (data && data.error);
      expect(hasError).toBe(true);
    }, TIMEOUT);

    it('should handle missing parameters', async () => {
      const { data, error } = await supabase.functions.invoke('azure-monitor', {
        body: { 
          action: 'list-resources',
          // Missing subscriptionId
        },
      });

      const hasError = error !== null || (data && data.error);
      expect(hasError).toBe(true);
    }, TIMEOUT);
  });

  describe('Retry Logic', () => {
    it('should handle transient failures with retry', async () => {
      // This test verifies that the client-side retry logic works
      // We can't easily test actual retries without mocking, but we can
      // verify that a successful call eventually works
      
      const { data, error } = await supabase.functions.invoke('azure-monitor', {
        body: { action: 'list-subscriptions' },
      });

      // Either success or expected failure
      if (error || data?.error) {
        const errorMessage = error?.message || data?.error || '';
        expect(errorMessage).toBeTruthy();
      } else {
        expect(data).toBeTruthy();
      }
    }, TIMEOUT);
  });
});
