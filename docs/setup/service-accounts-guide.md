# Service Accounts Setup Guide

## Overview

This guide provides step-by-step instructions for setting up all required service accounts for the Joe Perks platform, following security best practices for multi-tenant SaaS.

## Service Account Checklist

### ✅ Already Configured
- [x] **Supabase**: Database service (you mentioned already set up)
- [x] **Local Development Tools**: Node.js, pnpm, Git, Nx CLI, Vercel CLI

### ⏳ Needs Configuration
- [ ] **Stytch**: Authentication service
- [ ] **Stripe**: Payment processing
- [ ] **Redis**: Caching service
- [ ] **SendGrid**: Email service
- [ ] **Twilio**: SMS service
- [ ] **Railway**: Backend deployment
- [ ] **Vercel**: Frontend deployment (account setup)

## 1. Stytch Authentication Setup

### Account Creation
1. Go to https://stytch.com and create an account
2. Verify your email and complete onboarding

### Project Setup
Create separate projects for each environment:

#### Development Project
1. Create project: `joeperks-development`
2. Configure settings:
   - **Environment**: Test
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3001/auth/callback`
     - `http://localhost:3002/auth/callback`
     - `http://localhost:3003/auth/callback`
   - **Allowed Origins**: `http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003`

#### Staging Project
1. Create project: `joeperks-staging`
2. Configure settings:
   - **Environment**: Test
   - **Redirect URLs**: 
     - `https://staging-storefront.joeperks.com/auth/callback`
     - `https://staging-admin.joeperks.com/auth/callback`
     - `https://staging-roaster.joeperks.com/auth/callback`
     - `https://staging-org.joeperks.com/auth/callback`

#### Production Project
1. Create project: `joeperks-production`
2. Configure settings:
   - **Environment**: Live
   - **Redirect URLs**: 
     - `https://storefront.joeperks.com/auth/callback`
     - `https://admin.joeperks.com/auth/callback`
     - `https://roaster.joeperks.com/auth/callback`
     - `https://org.joeperks.com/auth/callback`

### RBAC Configuration
Set up roles for each project:
- `platform_admin`: Full system access
- `organization_admin`: Full organization access
- `campaign_manager`: Campaign management
- `organization_viewer`: Read-only organization access
- `roaster_admin`: Full roaster portal access
- `roaster_staff`: Order fulfillment only
- `customer`: Purchase and order history

### Get Credentials
For each project, collect:
- Project ID
- Secret Key
- Public Token

## 2. Stripe Connect Setup

### Account Creation
1. Go to https://stripe.com and create an account
2. Complete business verification
3. Enable Stripe Connect in your dashboard

### Connect Configuration
1. Go to Connect settings
2. Enable Express accounts
3. Configure branding and terms of service
4. Set up application fee structure

### Webhook Configuration
Set up webhooks for each environment:

#### Development Webhooks
- Endpoint: `http://localhost:9000/webhooks/stripe`
- Events: `payment_intent.succeeded`, `transfer.created`, `account.updated`

#### Staging Webhooks
- Endpoint: `https://staging-api.joeperks.com/webhooks/stripe`
- Events: `payment_intent.succeeded`, `transfer.created`, `account.updated`

#### Production Webhooks
- Endpoint: `https://api.joeperks.com/webhooks/stripe`
- Events: `payment_intent.succeeded`, `transfer.created`, `account.updated`

### Get Credentials
For each environment, collect:
- Publishable Key
- Secret Key
- Webhook Secret
- Connect Client ID

## 3. Redis Cache Setup

### Option A: Redis Cloud (Recommended)
1. Go to https://redis.com/redis-enterprise-cloud/
2. Create account and verify email
3. Create databases for each environment:
   - `joeperks-development`
   - `joeperks-staging`
   - `joeperks-production`

### Option B: Upstash
1. Go to https://upstash.com
2. Create account and verify email
3. Create Redis databases for each environment

### Option C: Railway Redis
1. Set up during Railway backend deployment
2. Use Railway's managed Redis service

### Get Credentials
For each environment, collect:
- Redis URL (connection string)

## 4. SendGrid Email Setup

### Account Creation
1. Go to https://sendgrid.com and create account
2. Complete email verification
3. Set up sender authentication

### Domain Authentication
1. Add your domain: `joeperks.com`
2. Configure DNS records for domain verification
3. Set up DKIM and SPF records

### API Key Creation
Create separate API keys for each environment:
- `joeperks-development-api-key`
- `joeperks-staging-api-key`
- `joeperks-production-api-key`

### Template Setup
Create email templates for:
- Welcome emails
- Order confirmations
- Campaign notifications
- Password reset emails

## 5. Twilio SMS Setup

### Account Creation
1. Go to https://twilio.com and create account
2. Complete phone verification
3. Add billing information

### Phone Number Setup
Purchase phone numbers for each environment:
- Development: Use Twilio test credentials
- Staging: Purchase a test phone number
- Production: Purchase a production phone number

### Messaging Service
Create messaging services for each environment with appropriate compliance settings.

### Get Credentials
For each environment, collect:
- Account SID
- Auth Token
- Phone Number

## 6. Railway Backend Deployment

### Account Creation
1. Go to https://railway.app and create account
2. Connect your GitHub account
3. Verify email and complete onboarding

### Project Setup
Create projects for each environment:
- `joeperks-development`
- `joeperks-staging`
- `joeperks-production`

### Environment Variables
Configure environment variables for each project using the generated secrets.

## 7. Vercel Frontend Deployment

### Account Setup
1. Go to https://vercel.com and create account
2. Connect your GitHub account
3. Import your repository

### Project Configuration
Set up projects for each frontend app:
- Storefront
- Admin Dashboard
- Roaster Portal
- Organization Dashboard

### Domain Configuration
Configure custom domains for each environment.

## Environment Configuration

### Development Environment
```bash
# Copy the template
cp config/environments/.env.local.example config/secrets/development/.env.local

# Edit the file and add your service credentials
# Use the generated secrets from: config/secrets/development/.env.development
```

### Staging Environment
```bash
# Generate staging secrets
./scripts/generate-secrets.sh staging

# Copy the template
cp config/environments/.env.staging.example config/secrets/staging/.env.staging

# Edit the file and add your service credentials
```

### Production Environment
```bash
# Generate production secrets
./scripts/generate-secrets.sh production

# Copy the template
cp config/environments/.env.production.example config/secrets/production/.env.production

# Edit the file and add your service credentials
```

## Security Checklist

### Before Going Live
- [ ] All service accounts use separate credentials per environment
- [ ] Production uses live/production modes for all services
- [ ] All secrets are unique and strong (256-bit minimum)
- [ ] Webhook endpoints are properly secured
- [ ] Rate limiting is configured
- [ ] Monitoring and alerting are set up
- [ ] Backup and disaster recovery procedures are tested

### Regular Maintenance
- [ ] Rotate secrets quarterly
- [ ] Review service account permissions monthly
- [ ] Monitor for suspicious activity
- [ ] Keep service integrations updated
- [ ] Regular security audits

## Next Steps

1. **Complete Service Account Setup**: Follow this guide to set up all required services
2. **Configure Environment Files**: Add actual credentials to environment files
3. **Test Integrations**: Verify all services work correctly in development
4. **Deploy to Staging**: Test the complete flow in staging environment
5. **Production Deployment**: Deploy to production with live credentials

## Support

If you encounter issues during setup:
1. Check service documentation for troubleshooting
2. Verify all credentials are correctly configured
3. Test each service integration individually
4. Review security settings and permissions

---

**Security Reminder**: Always use separate service accounts and credentials for each environment. Never use production credentials in development or staging environments.
