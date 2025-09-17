# Environment Setup Guide

## Overview

This document provides comprehensive instructions for setting up secure environments for the Joe Perks platform, following the greenfield build guide specifications.

## Technology Stack (Final)

Based on the authoritative greenfield build guide:

- **Package Manager**: pnpm
- **Monorepo**: Nx with best-practice names
- **Backend**: Medusa v2 (MikroORM) + native marketplace module
- **Database**: Supabase Postgres (dev/staging/prod)
- **Cache**: Redis 7 (managed, no local docker by default)
- **Authentication**: Stytch (auth + RBAC) across all apps
- **Payments**: Stripe Connect (Express accounts, payouts to roasters)
- **Frontend**: Next.js apps (storefront, platform admin, organization dashboard, roaster portal)
- **Deployment**: Vercel (Next.js) + Railway (Medusa)
- **Notifications**: SendGrid (email) + Twilio (SMS)
- **Multi-tenancy**: Subdomain-based, path fallback in dev
- **Node**: 20 LTS

## Environment Structure

### Secure Configuration Layout
```
config/
├── environments/           # Templates (safe to commit)
│   ├── .env.local.example
│   ├── .env.staging.example
│   └── .env.production.example
├── secrets/               # Actual secrets (NEVER commit)
│   ├── development/
│   ├── staging/
│   └── production/
├── keys/                  # Encryption keys (NEVER commit)
│   ├── jwt/
│   └── encryption/
└── SECURITY.md           # Security documentation
```

## Prerequisites Verification

### Local Development Tools ✅
- Node.js 20 LTS: v20.19.5
- pnpm: v10.13.1 (exceeds requirement of 9+)
- Git: v2.39.5
- Nx CLI: v21.5.2 (available via pnpm dlx)
- Vercel CLI: Already installed

### Service Accounts Required

#### Supabase (Database)
- **Status**: ✅ Already set up
- **Usage**: Postgres database per environment
- **Configuration**: Connection URLs needed for each environment

#### Stytch (Authentication)
- **Status**: ⏳ Needs setup
- **Usage**: Auth + RBAC across all applications
- **Requirements**: Project per environment (dev/staging/prod)

#### Stripe (Payments)
- **Status**: ⏳ Needs setup
- **Usage**: Connect Express accounts, payouts to roasters
- **Requirements**: Test mode for dev/staging, live mode for production

#### Redis (Cache)
- **Status**: ⏳ Needs setup
- **Usage**: Session storage and performance caching
- **Options**: Redis Cloud, Upstash, or Railway Redis

#### SendGrid (Email)
- **Status**: ⏳ Needs setup
- **Usage**: Transactional emails
- **Requirements**: API key and verified sender domain

#### Twilio (SMS)
- **Status**: ⏳ Needs setup
- **Usage**: SMS notifications
- **Requirements**: Account SID, Auth Token, Phone Number

#### Vercel (Frontend Deployment)
- **Status**: ✅ CLI installed
- **Usage**: Next.js app deployments
- **Requirements**: Account setup and project configuration

#### Railway (Backend Deployment)
- **Status**: ⏳ Needs setup
- **Usage**: Medusa backend deployment
- **Requirements**: Account setup and project configuration

## Environment Setup Process

### Step 1: Generate Secure Secrets

```bash
# Generate secrets for development environment
./scripts/generate-secrets.sh development

# Generate secrets for staging environment
./scripts/generate-secrets.sh staging

# Generate secrets for production environment
./scripts/generate-secrets.sh production
```

### Step 2: Create Environment Files

```bash
# Copy templates to actual environment files
cp config/environments/.env.local.example config/secrets/development/.env.local
cp config/environments/.env.staging.example config/secrets/staging/.env.staging
cp config/environments/.env.production.example config/secrets/production/.env.production
```

### Step 3: Configure Service Accounts

#### Supabase Configuration
1. Use existing Supabase project or create new ones for staging/production
2. Get connection URLs and API keys
3. Configure Row Level Security (RLS) policies
4. Set up environment-specific databases

#### Stytch Setup
1. Create Stytch account at https://stytch.com
2. Create separate projects for each environment:
   - `joeperks-development`
   - `joeperks-staging`
   - `joeperks-production`
3. Configure OAuth providers and redirect URLs
4. Set up RBAC roles and permissions
5. Get project IDs, secrets, and public tokens

#### Stripe Connect Setup
1. Create Stripe account at https://stripe.com
2. Enable Connect Express accounts
3. Configure webhooks for each environment
4. Set up test data for development/staging
5. Get API keys and webhook secrets

### Step 4: Domain Configuration

#### Development
- Use `lvh.me` for local subdomain testing
- Configure DNS to point `*.lvh.me` to `127.0.0.1`

#### Staging
- Set up staging subdomains:
  - `staging-api.joeperks.com`
  - `staging-admin.joeperks.com`
  - `staging-storefront.joeperks.com`
  - `staging-roaster.joeperks.com`
  - `staging-org.joeperks.com`

#### Production
- Configure production domains:
  - `api.joeperks.com`
  - `admin.joeperks.com`
  - `storefront.joeperks.com`
  - `roaster.joeperks.com`
  - `org.joeperks.com`
- Set up wildcard SSL certificates
- Configure CDN and load balancing

## Security Best Practices

### Secret Management
- ✅ Environment-specific secrets generated
- ✅ Strong encryption (256-bit minimum)
- ✅ Secrets never committed to version control
- ✅ Regular rotation schedule (quarterly)

### Multi-Tenant Security
- Database-level tenant isolation
- API middleware validates tenant context
- File storage with tenant-specific access
- Cache keys prefixed with tenant ID

### Access Control
- Principle of least privilege
- Role-based permissions (RBAC)
- Service account separation per environment
- Regular access reviews and audits

## Monitoring and Alerting

### Development
- Debug logging enabled
- Local monitoring tools
- Development-specific alerts

### Staging
- Production-like monitoring
- Performance testing
- Security scanning
- Load testing

### Production
- Comprehensive monitoring (Railway + Vercel)
- Real-time alerting
- Security incident response
- Business metrics tracking

## Next Steps

1. ✅ **Environment Structure Created**: Secure configuration layout implemented
2. ⏳ **Service Account Setup**: Configure Stytch, Stripe, and other services
3. ⏳ **Environment Configuration**: Fill in actual secrets and API keys
4. ⏳ **Domain Setup**: Configure DNS and SSL certificates
5. ⏳ **Security Testing**: Validate multi-tenant isolation and access controls

## Validation Checklist

### Before Proceeding to Step 02
- [ ] All required service accounts created
- [ ] Environment files configured with actual secrets
- [ ] Domain configuration completed
- [ ] Security measures validated
- [ ] Monitoring and alerting configured
- [ ] Documentation updated with actual values

---

**Security Reminder**: Never commit actual secrets to version control. Always use the secure environment structure and follow the security guidelines in `config/SECURITY.md`.
