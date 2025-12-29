# Azure Tenant Configuration Guide

This document provides instructions for integrating your SE Customer Portal with Azure.

## Prerequisites

1. An Azure subscription with appropriate permissions
2. Azure AD (Entra ID) admin access
3. Ability to create app registrations and service principals

## Step 1: Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name**: SE Customer Portal
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: 
     - Platform: Web
     - URI: `https://your-app-url.com/auth` (update with your actual URL)
5. Click **Register**

## Step 2: Configure App Registration

### Add API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Add these **Delegated permissions**:
   - `User.Read`
   - `GroupMember.Read.All`
   - `openid`
   - `profile`
   - `email`
5. Click **Grant admin consent**

### Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: "SE Portal Secret"
4. Set expiration (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the secret value immediately (you won't see it again)

### Note Your IDs

From the **Overview** page, copy:
- **Application (client) ID**
- **Directory (tenant) ID**

## Step 3: Create Service Principal for Azure Management

1. Open Azure Cloud Shell or Azure CLI
2. Run the following command:

```bash
az ad sp create-for-rbac --name "SE-Portal-ServicePrincipal" \
  --role "Reader" \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

3. Save the output (client_id, client_secret, tenant_id)
4. Grant additional permissions:

```bash
# For monitoring metrics
az role assignment create \
  --assignee YOUR_SERVICE_PRINCIPAL_CLIENT_ID \
  --role "Monitoring Reader" \
  --scope /subscriptions/YOUR_SUBSCRIPTION_ID

# For log analytics
az role assignment create \
  --assignee YOUR_SERVICE_PRINCIPAL_CLIENT_ID \
  --role "Log Analytics Reader" \
  --scope /subscriptions/YOUR_SUBSCRIPTION_ID
```

## Step 4: Configure Azure AD Groups for RBAC

1. In Azure AD, go to **Groups**
2. Create groups for your roles:
   - `SE-Portal-Admins`
   - `SE-Portal-Operations`
   - `SE-Portal-Customers`
3. Add users to appropriate groups
4. Note the **Object ID** of each group

## Step 5: Configure Environment Variables

### For Local Development

Create a `.env.local` file:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Azure App Registration
AZURE_CLIENT_ID=your_app_registration_client_id
AZURE_CLIENT_SECRET=your_app_registration_client_secret
AZURE_TENANT_ID=your_tenant_id

# Group to Role Mapping
AZURE_GROUP_ROLE_MAPPING=group_id_1:admin,group_id_2:operations_engineer,group_id_3:customer
```

### For Supabase Edge Functions

1. Go to your Supabase project
2. Navigate to **Project Settings** > **Edge Functions**
3. Add secrets:

```bash
supabase secrets set AZURE_CLIENT_ID=your_service_principal_client_id
supabase secrets set AZURE_CLIENT_SECRET=your_service_principal_client_secret
supabase secrets set AZURE_TENANT_ID=your_tenant_id
```

## Step 6: Test the Integration

1. Start your development server
2. Navigate to `/auth`
3. Click "Sign in with Microsoft"
4. Verify successful authentication
5. Check that user roles are properly assigned
6. Verify Azure resources are displayed in the dashboard

## Troubleshooting

### "Azure credentials not configured"

- Verify environment variables are set correctly
- Check Supabase Edge Function secrets
- Ensure service principal has proper permissions

### "Failed to get Azure access token"

- Verify client secret hasn't expired
- Check tenant ID is correct
- Ensure service principal exists and is active

### "No resources found"

- Verify Reader role is assigned to service principal
- Check subscription ID in the scope
- Ensure resources exist in the subscription

### "Group membership not working"

- Verify GroupMember.Read.All permission is granted
- Check admin consent was provided
- Ensure group IDs in mapping are correct

## Security Best Practices

1. **Rotate secrets regularly**: Update client secrets every 6-12 months
2. **Use least privilege**: Only grant necessary permissions
3. **Monitor access**: Enable Azure AD sign-in logs
4. **Use managed identities**: When deploying to Azure, use managed identities instead of service principals
5. **Secure environment variables**: Never commit secrets to version control
6. **Enable MFA**: Require multi-factor authentication for all users

## Additional Resources

- [Azure App Registration Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Azure RBAC Documentation](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)
- [Microsoft Graph API Reference](https://learn.microsoft.com/en-us/graph/api/overview)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
