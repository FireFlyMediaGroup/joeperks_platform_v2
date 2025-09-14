# Joe Perks Platform - Setup Documentation

## Overview

This document provides a comprehensive overview of the Joe Perks platform setup, completed steps, and essential information for developers joining the project.

## 🏗️ Platform Architecture

Joe Perks is a **multi-tenant coffee fundraising marketplace** built with modern technologies:

- **Frontend**: Next.js 15 applications (4 separate apps)
- **Backend**: Medusa v2 e-commerce framework
- **Database**: Supabase PostgreSQL with connection pooling
- **Authentication**: Stytch (planned)
- **Payments**: Stripe Connect (planned)
- **Cache**: Redis (planned)
- **Deployment**: Railway + Vercel
- **Monorepo**: Nx workspace with pnpm

## ✅ Completed Setup Steps

### **Step 01: Prerequisites** ✅ COMPLETE
- **Environment Verified**: Node.js 20 LTS, pnpm 10+, Git, Nx CLI, Vercel CLI
- **Secure Environment Structure**: Multi-tenant security configuration
- **Documentation Aligned**: All architecture docs updated and consistent
- **Service Account Guides**: Comprehensive setup instructions created

### **Step 02: Bootstrap Monorepo** ✅ COMPLETE
- **Nx Workspace**: Fully configured with pnpm package management
- **Next.js Applications**: 4 applications scaffolded and verified
- **Shared Libraries**: 3 libraries for code reuse
- **Build System**: All projects build successfully
- **Development Tools**: ESLint, Prettier, TypeScript configured

### **Step 03: Backend Medusa v2** ✅ COMPLETE
- **Medusa Server**: v2.10.2 scaffolded and configured
- **Database Integration**: Connected to Supabase PostgreSQL
- **Migrations**: 95%+ completed (core e-commerce schema ready)
- **Nx Integration**: Custom targets for serve, build, migrate
- **Security**: Cryptographically secure secrets generated

## 🚀 Current Project Structure

```
joeperks_platform/
├── apps/                           # Applications
│   ├── storefront-customer/        # Customer-facing storefronts
│   ├── admin-platform/             # Platform administration
│   ├── dashboard-organization/     # Organization management
│   ├── portal-roaster/             # Roaster portal
│   └── medusa-server/              # E-commerce backend API
├── libs/                           # Shared libraries
│   ├── shared-ui/                  # UI components
│   ├── shared-types/               # TypeScript types
│   └── shared-utils/               # Utility functions
├── config/                         # Secure environment configuration
│   ├── environments/               # Environment templates
│   ├── secrets/                    # Actual secrets (gitignored)
│   └── keys/                       # Encryption keys (gitignored)
├── docs/                           # Documentation
│   ├── architecture/               # Technical architecture
│   ├── greenfield/                 # Build guide (14 steps)
│   ├── setup/                      # Setup documentation
│   └── stories/                    # User stories
└── scripts/                        # Utility scripts
```

## 🔧 Development Environment

### **Prerequisites**
- **Node.js**: v20.19.5 LTS
- **Package Manager**: pnpm v10.13.1
- **Monorepo Tool**: Nx v21.5.2
- **Git**: v2.39.5+

### **Quick Start**
```bash
# Clone and setup
git clone <repository-url>
cd joeperks_platform
pnpm install

# Start development servers
pnpm nx serve storefront-customer    # Customer app (port 3000)
pnpm nx serve admin-platform         # Admin app (port 4000)
pnpm nx serve medusa-server          # Backend API (port 9000)

# Build all projects
pnpm nx run-many -t build

# Run tests
pnpm nx run-many -t test
```

### **Admin Access**
- **Admin Panel**: http://localhost:9000/app
- **Email**: `admin@joeperks.com`
- **Password**: `admin123`
- **Full Credentials**: See `config/secrets/development/admin-credentials.md`

> **📖 Important**: This is the Medusa Admin Panel for technical operations. See `docs/admin-interfaces-guide.md` for information about the different admin interfaces and their purposes.

### **Available Applications**

| Application | Purpose | Port | Status |
|-------------|---------|------|--------|
| `storefront-customer` | Organization-branded storefronts | 3000 | ✅ Ready |
| `admin-platform` | Platform administration | 4000 | ✅ Ready |
| `dashboard-organization` | Organization management | 3001 | ✅ Ready |
| `portal-roaster` | Roaster management portal | 3002 | ✅ Ready |
| `medusa-server` | E-commerce backend API | 9000 | ✅ Ready |

## 🔐 Security & Environment Management

### **Environment Structure**
```
config/
├── environments/           # Safe templates (committed)
│   ├── .env.local.example
│   ├── .env.staging.example
│   └── .env.production.example
├── secrets/               # Actual secrets (gitignored)
│   ├── development/
│   ├── staging/
│   └── production/
└── keys/                  # Encryption keys (gitignored)
    ├── encryption/
    └── jwt/
```

### **Secret Generation**
```bash
# Generate secure secrets for any environment
./scripts/generate-secrets.sh development
./scripts/generate-secrets.sh staging
./scripts/generate-secrets.sh production
```

### **Database Configuration**
- **Provider**: Supabase PostgreSQL
- **Connection**: Connection pooling enabled
- **Schema**: Complete Medusa e-commerce schema
- **Migrations**: Automated via `pnpm nx migrate medusa-server`

## 📋 Pending Setup Steps

### **Step 04: Database Supabase** 🔄 NEXT
- Additional Supabase configuration
- Row Level Security (RLS) setup
- Multi-tenant data isolation

### **Step 05: Cache Redis** 🔄 PENDING
- Redis service selection and setup
- Cache configuration for Medusa
- Session storage configuration

### **Step 06: Authentication Stytch** 🔄 PENDING
- Stytch account setup and configuration
- Multi-tenant authentication flows
- Role-based access control (RBAC)

### **Remaining Steps (07-14)**
- Marketplace plugin integration
- Stripe Connect payment processing
- Frontend application development
- Multi-tenancy routing
- Notification services
- CI/CD pipeline
- Deployment configuration
- Acceptance testing

## 🛠️ Development Workflows

### **Adding New Features**
1. Create feature branch: `git checkout -b feature/your-feature`
2. Develop in appropriate app/library
3. Use shared libraries for common functionality
4. Write tests: `pnpm nx test <project-name>`
5. Build and verify: `pnpm nx build <project-name>`
6. Create pull request

### **Database Changes**
1. Modify Medusa entities in `apps/medusa-server/src/`
2. Generate migration: `pnpm nx migrate medusa-server`
3. Test migration on development database
4. Commit migration files

### **Adding Dependencies**
```bash
# Add to specific project
cd apps/storefront-customer
pnpm add <package-name>

# Add to workspace root (affects all projects)
pnpm add -w <package-name>

# Add to shared library
cd libs/shared-ui
pnpm add <package-name>
```

## 🔍 Troubleshooting

### **Common Issues**

**Build Failures**
```bash
# Clear Nx cache
pnpm nx reset

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Database Connection Issues**
```bash
# Test database connection
cd apps/medusa-server
pnpm exec medusa db:migrate

# Check environment variables
cat .env | grep DATABASE_URL
```

**Port Conflicts**
- Medusa server: 9000
- Customer app: 3000
- Admin app: 4000
- Check for running processes: `lsof -i :9000`

### **Getting Help**
1. Check documentation in `docs/` folder
2. Review architecture decisions in `docs/architecture/`
3. Consult greenfield build guide: `docs/greenfield/README.md`
4. Check service account setup: `docs/setup/service-accounts-guide.md`

## 📚 Key Documentation

| Document | Purpose |
|----------|---------|
| `docs/prd.md` | Product Requirements Document |
| `docs/architecture.md` | Technical Architecture Overview |
| `docs/greenfield/README.md` | Complete Build Guide (14 steps) |
| `docs/setup/service-accounts-guide.md` | External Service Configuration |
| `config/SECURITY.md` | Security Best Practices |

## 🎯 Next Developer Onboarding

### **For New Developers**
1. **Read this document** and the PRD (`docs/prd.md`)
2. **Set up development environment** following prerequisites
3. **Run the quick start commands** to verify setup
4. **Review the architecture** (`docs/architecture/`)
5. **Check current progress** in greenfield guide (`docs/greenfield/README.md`)
6. **Set up IDE** with recommended extensions (ESLint, Prettier, TypeScript)

### **Recommended IDE Setup**
- **VS Code Extensions**: 
  - Nx Console
  - ESLint
  - Prettier
  - TypeScript Hero
  - GitLens

### **Development Standards**
- **Code Style**: Enforced by ESLint + Prettier
- **Commit Messages**: Conventional commits format
- **Branch Naming**: `feature/`, `bugfix/`, `hotfix/` prefixes
- **Testing**: Required for new features
- **Documentation**: Update docs for architectural changes

---

**Last Updated**: Step 03 Complete - Medusa v2 Backend Ready
**Next Step**: Step 04 - Database Supabase Configuration
**Status**: 3/14 steps complete (21% progress)
