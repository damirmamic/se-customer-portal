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

// Entra ID group to role mapping - configure these to match your Entra ID groups
// IMPORTANT: Only use server-side mapping, never accept group mapping from client
const GROUP_ROLE_MAPPING: Record<string, 'customer' | 'operations_engineer' | 'admin'> = {
  // Map a specific Entra group to operations_engineer role
  '769e43cb-abfd-4421-8e74-ecd14725d796': 'operations_engineer',
};

interface EntraTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
}

interface EntraUserInfo {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  givenName?: string;
  surname?: string;
}

interface EntraGroupMembership {
  value: Array<{ id: string; displayName?: string }>;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, redirectUri, codeChallenge, codeVerifier } = await req.json();

    const clientId = Deno.env.get('AZURE_CLIENT_ID');
    const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET');
    const tenantId = 'common'; // Accepts both personal Microsoft accounts and work/school accounts

    if (!clientId) {
      console.error('Missing AZURE_CLIENT_ID');
      return new Response(
        JSON.stringify({ error: 'Authentication service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!clientSecret) {
      console.error('Missing AZURE_CLIENT_SECRET');
      return new Response(
        JSON.stringify({ error: 'Authentication service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-auth-url') {
      // Generate authorization URL for Entra ID with PKCE
      if (!redirectUri || !codeChallenge) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate redirect URI against allowed origins
      const redirectOrigin = new URL(redirectUri).origin;
      if (!isAllowedOrigin(redirectOrigin)) {
        console.error('Invalid redirect URI origin:', redirectOrigin);
        return new Response(
          JSON.stringify({ error: 'Invalid redirect URI' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const scope = encodeURIComponent('openid profile email User.Read GroupMember.Read.All');
      const responseType = 'code';
      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `response_type=${responseType}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scope}&` +
        `response_mode=query&` +
        `code_challenge=${encodeURIComponent(codeChallenge)}&` +
        `code_challenge_method=S256`;

      console.log('Generated auth URL for redirect:', redirectUri);

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'exchange-code') {
      // Exchange authorization code for tokens (PKCE)
      if (!code || !redirectUri) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!codeVerifier) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate redirect URI against allowed origins
      const redirectOrigin = new URL(redirectUri).origin;
      if (!isAllowedOrigin(redirectOrigin)) {
        console.error('Invalid redirect URI origin:', redirectOrigin);
        return new Response(
          JSON.stringify({ error: 'Invalid redirect URI' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

      // Web platform requires client_secret for confidential client flow
      const tokenParams: Record<string, string> = {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'openid profile email User.Read GroupMember.Read.All',
        code_verifier: codeVerifier,
      };
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(tokenParams),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange failed:', error);
        return new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokens: EntraTokenResponse = await tokenResponse.json();
      console.log('Token exchange successful');

      // Get user info from Microsoft Graph
      const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userResponse.ok) {
        console.error('Failed to get user info');
        return new Response(
          JSON.stringify({ error: 'Failed to get user information' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userInfo: EntraUserInfo = await userResponse.json();
      console.log('Got user info:', userInfo.userPrincipalName);

      // Get user's group memberships
      const groupsResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      let userGroups: string[] = [];
      if (groupsResponse.ok) {
        const groupsData: EntraGroupMembership = await groupsResponse.json();
        userGroups = groupsData.value.map(g => g.id);
        console.log('User groups:', userGroups);
      } else {
        console.warn('Could not fetch group memberships');
      }

      // Determine roles based on group membership - ONLY use server-side mapping
      const roles: ('customer' | 'operations_engineer' | 'admin')[] = [];
      for (const [groupId, role] of Object.entries(GROUP_ROLE_MAPPING)) {
        if (userGroups.includes(groupId)) {
          roles.push(role as 'customer' | 'operations_engineer' | 'admin');
        }
      }
      // Default to customer if no matching groups
      if (roles.length === 0) {
        roles.push('customer');
      }
      console.log('Assigned roles:', roles);

      // Create or update user in Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const email = userInfo.mail || userInfo.userPrincipalName;
      const password = crypto.randomUUID(); // Generate random password for SSO user

      // Try to get existing user
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      let userId: string;
      let existingUser = existingUsers?.users?.find(u => u.email === email);

      // Capture old roles for audit logging
      let oldRoles: { role: string }[] = [];

      if (existingUser) {
        userId = existingUser.id;
        console.log('Found existing user:', userId);
        
        // Fetch existing roles for audit
        const { data: currentRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        oldRoles = currentRoles || [];
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: userInfo.displayName,
            first_name: userInfo.givenName,
            last_name: userInfo.surname,
            entra_id: userInfo.id,
            provider: 'azure_ad',
          },
        });

        if (createError) {
          console.error('Failed to create user:', createError);
          return new Response(
            JSON.stringify({ error: 'Failed to create user account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        userId = newUser.user.id;
        console.log('Created new user:', userId);
      }

      // Sync roles from Entra ID groups
      // First, delete existing roles
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // Insert new roles
      for (const role of roles) {
        const matchingGroupId = Object.entries(GROUP_ROLE_MAPPING).find(([, r]) => r === role)?.[0];
        await supabase.from('user_roles').insert({
          user_id: userId,
          role,
          entra_group_id: matchingGroupId || null,
        });
      }
      console.log('Synced roles for user');

      // Audit log the role change
      const roleChangeLog = {
        timestamp: new Date().toISOString(),
        user_id: userId,
        email: email,
        action: 'entra_sso_sync',
        old_roles: oldRoles.map(r => r.role),
        new_roles: roles,
        entra_groups: userGroups,
        entra_id: userInfo.id,
      };
      console.log('AUDIT: Role sync completed', JSON.stringify(roleChangeLog));

      // Generate a session for the user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: redirectUri }
      });

      if (sessionError) {
        console.error('Failed to generate session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          user: {
            id: userId,
            email,
            name: userInfo.displayName,
            roles,
          },
          magicLink: sessionData.properties?.action_link,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const corsHeaders = getCorsHeaders(req);
    console.error('Error in entra-auth function:', error);
    // Return generic error to client, log details server-side
    return new Response(
      JSON.stringify({ error: 'An error occurred during authentication' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
