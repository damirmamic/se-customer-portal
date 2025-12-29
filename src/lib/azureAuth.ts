/**
 * Azure Authentication Service
 * Handles Microsoft Entra ID (Azure AD) authentication with PKCE flow
 */

interface PKCECodes {
  codeVerifier: string;
  codeChallenge: string;
}

/**
 * Generate a cryptographically random string for PKCE
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((v) => charset[v % charset.length])
    .join('');
}

/**
 * Generate SHA256 hash
 */
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

/**
 * Base64 URL encode
 */
function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCE(): Promise<PKCECodes> {
  const codeVerifier = generateRandomString(128);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64URLEncode(hashed);
  
  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Store PKCE codes in session storage
 */
export function storePKCE(codes: PKCECodes): void {
  sessionStorage.setItem('pkce_code_verifier', codes.codeVerifier);
  sessionStorage.setItem('pkce_code_challenge', codes.codeChallenge);
}

/**
 * Retrieve PKCE codes from session storage
 */
export function retrievePKCE(): PKCECodes | null {
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
  const codeChallenge = sessionStorage.getItem('pkce_code_challenge');
  
  if (!codeVerifier || !codeChallenge) {
    return null;
  }
  
  return { codeVerifier, codeChallenge };
}

/**
 * Clear PKCE codes from session storage
 */
export function clearPKCE(): void {
  sessionStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('pkce_code_challenge');
}

/**
 * Validate Azure environment configuration
 */
export function validateAzureConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = [
    'AZURE_CLIENT_ID',
    'AZURE_CLIENT_SECRET',
    'AZURE_TENANT_ID',
  ];
  
  const missingVars: string[] = [];
  
  for (const varName of requiredVars) {
    const value = import.meta.env[`VITE_${varName}`];
    if (!value || value === '' || value === 'undefined') {
      missingVars.push(varName);
    }
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

/**
 * Get redirect URI for current environment
 */
export function getRedirectUri(): string {
  // In production, use the actual domain
  if (import.meta.env.PROD) {
    return `${window.location.origin}/auth/callback`;
  }
  
  // In development, use localhost
  return `${window.location.origin}/auth`;
}

/**
 * Azure authentication error types
 */
export enum AzureAuthErrorType {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_STATE = 'INVALID_STATE',
  USER_CANCELLED = 'USER_CANCELLED',
}

export class AzureAuthError extends Error {
  constructor(
    public type: AzureAuthErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AzureAuthError';
  }
}

/**
 * Parse error from Azure AD response
 */
export function parseAzureError(error: any): AzureAuthError {
  if (error?.error === 'access_denied') {
    return new AzureAuthError(
      AzureAuthErrorType.USER_CANCELLED,
      'User cancelled the authentication',
      error
    );
  }
  
  if (error?.error === 'invalid_grant') {
    return new AzureAuthError(
      AzureAuthErrorType.TOKEN_EXPIRED,
      'Authentication token expired or invalid',
      error
    );
  }
  
  if (error?.error === 'unauthorized_client') {
    return new AzureAuthError(
      AzureAuthErrorType.CONFIGURATION_ERROR,
      'Azure application not properly configured',
      error
    );
  }
  
  return new AzureAuthError(
    AzureAuthErrorType.AUTHENTICATION_ERROR,
    error?.error_description || error?.message || 'Authentication failed',
    error
  );
}
