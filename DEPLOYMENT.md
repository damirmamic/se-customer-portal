# Production Deployment Guide

This guide covers deploying the SE Customer Portal to production with proper Azure integration.

## Prerequisites

- Azure subscription with resources to monitor
- Supabase project (production tier recommended)
- Azure AD (Entra ID) tenant
- Domain name with SSL certificate
- CI/CD pipeline configured

## Pre-Deployment Checklist

### 1. Azure Configuration ✓

- [ ] App Registration created in Azure AD
- [ ] API permissions granted and admin consented
- [ ] Client secret created and stored securely
- [ ] Service Principal created with appropriate roles
- [ ] Azure AD groups created for RBAC
- [ ] Users assigned to appropriate groups
- [ ] Redirect URIs configured for production domain

### 2. Supabase Configuration ✓

- [ ] Production Supabase project created
- [ ] Edge Functions deployed
- [ ] Azure credentials configured as secrets
- [ ] Database migrations applied
- [ ] Row Level Security (RLS) policies configured
- [ ] Storage buckets configured (if needed)
- [ ] API keys rotated from defaults

### 3. Application Configuration ✓

- [ ] Environment variables configured
- [ ] Production build tested locally
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (if needed)
- [ ] Performance monitoring enabled
- [ ] All tests passing
- [ ] Security headers configured
- [ ] CORS policies set correctly

### 4. Security Review ✓

- [ ] Secrets not in source control
- [ ] Dependencies updated and scanned
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] CSRF protection enabled

## Deployment Steps

### Step 1: Configure Environment Variables

Create production environment variables:

```bash
# Production .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_production_anon_key
AZURE_CLIENT_ID=your_production_client_id
AZURE_CLIENT_SECRET=your_production_client_secret
AZURE_TENANT_ID=your_tenant_id
```

⚠️ **Never commit these to version control!**

### Step 2: Deploy Supabase Edge Functions

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy azure-monitor
supabase functions deploy entra-auth

# Set secrets
supabase secrets set AZURE_CLIENT_ID=your_sp_client_id
supabase secrets set AZURE_CLIENT_SECRET=your_sp_client_secret
supabase secrets set AZURE_TENANT_ID=your_tenant_id
```

### Step 3: Build Application

```bash
# Install dependencies
npm ci

# Run tests
npm run test:run

# Build for production
npm run build

# Preview build locally
npm run preview
```

### Step 4: Deploy to Hosting Platform

#### Option A: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Configure environment variables in Netlify dashboard
```

#### Option C: Azure Static Web Apps

```bash
# Using Azure CLI
az staticwebapp create \
  --name se-customer-portal \
  --resource-group your-rg \
  --source https://github.com/your-org/se-customer-portal \
  --location "East US" \
  --branch main \
  --app-location "/" \
  --output-location "dist"

# Configure environment variables in Azure Portal
```

#### Option D: Docker + Azure Container Apps

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and push
docker build -t se-customer-portal:latest .
docker tag se-customer-portal:latest your-acr.azurecr.io/se-customer-portal:latest
docker push your-acr.azurecr.io/se-customer-portal:latest

# Deploy to Container Apps
az containerapp create \
  --name se-customer-portal \
  --resource-group your-rg \
  --environment your-env \
  --image your-acr.azurecr.io/se-customer-portal:latest \
  --target-port 80 \
  --ingress external \
  --env-vars \
    VITE_SUPABASE_URL=secretref:supabase-url \
    VITE_SUPABASE_PUBLISHABLE_KEY=secretref:supabase-key
```

### Step 5: Configure DNS

Point your domain to the hosting platform:

```
# Example DNS records
Type  Name                Value
A     @                   Hosting IP
CNAME www                 your-app.hosting-provider.com
CNAME _acme-challenge    DNS validation record (for SSL)
```

### Step 6: Update Azure App Registration

Update redirect URIs in Azure AD:

1. Go to Azure Portal > App Registrations
2. Select your app
3. Go to Authentication
4. Add redirect URI: `https://your-domain.com/auth`
5. Add redirect URI: `https://your-domain.com/auth/callback`
6. Save changes

### Step 7: Enable Monitoring

#### Application Insights (Azure)

```typescript
// Add to src/main.tsx
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING,
  }
});
appInsights.loadAppInsights();
appInsights.trackPageView();
```

#### Error Tracking (Sentry)

```typescript
// Add to src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: "production",
    tracesSampleRate: 1.0,
  });
}
```

### Step 8: Security Headers

Configure security headers in your hosting platform:

```nginx
# nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

Or in Vercel/Netlify `vercel.json`/`netlify.toml`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## Post-Deployment Verification

### 1. Functionality Tests

- [ ] Authentication flow works
- [ ] Azure resources load correctly
- [ ] Metrics display accurately
- [ ] Alerts show up
- [ ] Role-based access works
- [ ] All pages are accessible
- [ ] Forms submit correctly
- [ ] Error states work

### 2. Performance Tests

```bash
# Run Lighthouse audit
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.json

# Target scores:
# Performance: > 90
# Accessibility: 100
# Best Practices: 100
# SEO: > 90
```

### 3. Security Tests

- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No sensitive data in client
- [ ] Authentication required
- [ ] RBAC enforced
- [ ] XSS protection works
- [ ] CSRF protection works

### 4. Load Tests

```bash
# Using k6 or Artillery
npm install -g artillery
artillery quick --count 10 --num 100 https://your-domain.com
```

## Monitoring & Maintenance

### Application Monitoring

Set up monitoring for:

- **Uptime**: Use Uptime Robot, Pingdom, or Azure Monitor
- **Performance**: Application Insights or New Relic
- **Errors**: Sentry or Rollbar
- **Logs**: Supabase logs, CloudWatch, or Datadog
- **User Analytics**: Google Analytics, Mixpanel, or Amplitude

### Health Checks

Create health check endpoint:

```typescript
// Health check for monitoring
export async function healthCheck() {
  try {
    // Check Supabase connection
    const { error: supabaseError } = await supabase
      .from('health')
      .select('*')
      .limit(1);
    
    if (supabaseError) throw supabaseError;
    
    // Check Azure connectivity
    // ... test Azure connection
    
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

### Backup Strategy

- **Database**: Automated Supabase backups (daily)
- **Configuration**: Store in version control
- **Secrets**: Backup in secure vault (Azure Key Vault)
- **User Data**: Regular exports

### Update Strategy

```bash
# 1. Create release branch
git checkout -b release/v1.1.0

# 2. Update version
npm version minor

# 3. Run full test suite
npm run test:run
npm run test:integration

# 4. Build and test
npm run build
npm run preview

# 5. Deploy to staging first
# Test in staging environment

# 6. Deploy to production
# Use blue-green or canary deployment

# 7. Monitor for issues
# Watch error rates and metrics

# 8. Tag release
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

## Rollback Plan

If issues occur after deployment:

### Quick Rollback

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Azure
az webapp deployment slot swap -g rg -n app --slot staging --target-slot production

# Docker
kubectl rollout undo deployment/se-customer-portal
```

### Manual Rollback

1. Identify last stable commit
2. Checkout that commit
3. Build application
4. Deploy to production
5. Verify functionality

## Scaling Considerations

### Frontend Scaling

- Use CDN for static assets
- Enable caching headers
- Implement code splitting
- Optimize images and assets
- Use lazy loading

### Backend Scaling

- Supabase scales automatically
- Monitor database connections
- Add read replicas if needed
- Implement request queuing
- Use connection pooling

### Cost Optimization

- Review Supabase usage metrics
- Optimize database queries
- Cache frequently accessed data
- Use appropriate Supabase tier
- Monitor Azure resource costs

## Troubleshooting Production Issues

### Common Issues

**Azure authentication fails**
1. Check App Registration redirect URIs
2. Verify client secret hasn't expired
3. Check CORS configuration
4. Review Azure AD logs

**Resources not loading**
1. Check Service Principal permissions
2. Verify Edge Function secrets
3. Review Supabase logs
4. Check network connectivity

**Performance issues**
1. Review database query performance
2. Check for N+1 queries
3. Enable caching
4. Review bundle size
5. Check CDN configuration

**High error rates**
1. Check error tracking dashboard
2. Review application logs
3. Check for failed deployments
4. Verify environment variables
5. Test Azure connectivity

## Support & Maintenance

### Regular Maintenance Tasks

- [ ] Weekly: Review error logs
- [ ] Weekly: Check performance metrics
- [ ] Bi-weekly: Update dependencies
- [ ] Monthly: Security audit
- [ ] Monthly: Backup verification
- [ ] Quarterly: Disaster recovery test
- [ ] Quarterly: Performance audit

### Contact Information

- **Azure Support**: [Azure Support Portal](https://portal.azure.com)
- **Supabase Support**: [Supabase Support](https://supabase.com/support)
- **Internal Team**: [Your team contact]

## Conclusion

Following this guide ensures a secure, performant, and reliable production deployment. Regular monitoring and maintenance will keep the portal running smoothly.

For questions or issues, refer to:
- [AZURE_SETUP.md](./AZURE_SETUP.md) for Azure configuration
- [TESTING.md](./TESTING.md) for testing procedures
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for implementation details
