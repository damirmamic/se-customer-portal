import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generatePKCE,
  storePKCE,
  retrievePKCE,
  clearPKCE,
  validateAzureConfig,
  getRedirectUri,
  parseAzureError,
  AzureAuthErrorType,
} from '../azureAuth';

describe('azureAuth utility functions', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('generatePKCE', () => {
    it('should generate valid PKCE codes', async () => {
      const codes = await generatePKCE();
      
      expect(codes).toHaveProperty('codeVerifier');
      expect(codes).toHaveProperty('codeChallenge');
      expect(codes.codeVerifier).toHaveLength(128);
      expect(codes.codeChallenge.length).toBeGreaterThan(0);
      expect(codes.codeChallenge).not.toContain('=');
      expect(codes.codeChallenge).not.toContain('+');
      expect(codes.codeChallenge).not.toContain('/');
    });

    it('should generate unique codes on each call', async () => {
      const codes1 = await generatePKCE();
      const codes2 = await generatePKCE();
      
      expect(codes1.codeVerifier).not.toBe(codes2.codeVerifier);
      expect(codes1.codeChallenge).not.toBe(codes2.codeChallenge);
    });
  });

  describe('PKCE storage', () => {
    it('should store and retrieve PKCE codes', async () => {
      const codes = await generatePKCE();
      storePKCE(codes);
      
      const retrieved = retrievePKCE();
      expect(retrieved).toEqual(codes);
    });

    it('should return null when no codes are stored', () => {
      const retrieved = retrievePKCE();
      expect(retrieved).toBeNull();
    });

    it('should clear PKCE codes', async () => {
      const codes = await generatePKCE();
      storePKCE(codes);
      clearPKCE();
      
      const retrieved = retrievePKCE();
      expect(retrieved).toBeNull();
    });
  });

  describe('validateAzureConfig', () => {
    it('should identify missing configuration', () => {
      const result = validateAzureConfig();
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('missingVars');
      expect(Array.isArray(result.missingVars)).toBe(true);
    });
  });

  describe('getRedirectUri', () => {
    it('should return a valid URI', () => {
      const uri = getRedirectUri();
      
      expect(uri).toContain('http');
      expect(uri).toContain('/auth');
    });
  });

  describe('parseAzureError', () => {
    it('should parse user cancellation error', () => {
      const error = parseAzureError({ error: 'access_denied' });
      
      expect(error.type).toBe(AzureAuthErrorType.USER_CANCELLED);
      expect(error.message).toContain('cancelled');
    });

    it('should parse invalid grant error', () => {
      const error = parseAzureError({ error: 'invalid_grant' });
      
      expect(error.type).toBe(AzureAuthErrorType.TOKEN_EXPIRED);
      expect(error.message).toContain('expired');
    });

    it('should parse unauthorized client error', () => {
      const error = parseAzureError({ error: 'unauthorized_client' });
      
      expect(error.type).toBe(AzureAuthErrorType.CONFIGURATION_ERROR);
      expect(error.message).toContain('configured');
    });

    it('should handle generic errors', () => {
      const error = parseAzureError({ 
        error: 'unknown_error',
        error_description: 'Something went wrong'
      });
      
      expect(error.type).toBe(AzureAuthErrorType.AUTHENTICATION_ERROR);
      expect(error.message).toContain('Something went wrong');
    });
  });
});
