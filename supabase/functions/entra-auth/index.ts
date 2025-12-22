import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Entra ID group to role mapping - configure these to match your Entra ID groups
const GROUP_ROLE_MAPPING: Record<string, 'customer' | 'operations_engineer' | 'admin'> = {
  // Add your Entra ID group IDs here
  // Example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx': 'admin',
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, redirectUri, groupMapping } = await req.json();

    const clientId = Deno.env.get('AZURE_CLIENT_ID');
    const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET');
    const tenantId = 'common'; // Accepts both personal Microsoft accounts and work/school accounts

    if (!clientId || !clientSecret) {
      console.error('Missing Azure credentials');
      return new Response(
        JSON.stringify({ error: 'Azure credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use group mapping from request if provided, otherwise use default
    const effectiveGroupMapping = groupMapping || GROUP_ROLE_MAPPING;

    if (action === 'get-auth-url') {
      // Generate authorization URL for Entra ID
      const scope = encodeURIComponent('openid profile email User.Read GroupMember.Read.All');
      const responseType = 'code';
      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `response_type=${responseType}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scope}&` +
        `response_mode=query`;

      console.log('Generated auth URL for redirect:', redirectUri);

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'exchange-code') {
      // Exchange authorization code for tokens
      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          scope: 'openid profile email User.Read GroupMember.Read.All',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange failed:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to exchange code for token' }),
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
          JSON.stringify({ error: 'Failed to get user info' }),
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

      // Determine roles based on group membership
      const roles: ('customer' | 'operations_engineer' | 'admin')[] = [];
      for (const [groupId, role] of Object.entries(effectiveGroupMapping)) {
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

      if (existingUser) {
        userId = existingUser.id;
        console.log('Found existing user:', userId);
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
            JSON.stringify({ error: 'Failed to create user' }),
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
        const matchingGroupId = Object.entries(effectiveGroupMapping).find(([, r]) => r === role)?.[0];
        await supabase.from('user_roles').insert({
          user_id: userId,
          role,
          entra_group_id: matchingGroupId || null,
        });
      }
      console.log('Synced roles for user');

      // Generate a session for the user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: redirectUri }
      });

      if (sessionError) {
        console.error('Failed to generate session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate session' }),
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
    console.error('Error in entra-auth function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});