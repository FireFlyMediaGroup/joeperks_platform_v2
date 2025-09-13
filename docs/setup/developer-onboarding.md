# Developer Onboarding Checklist

## Welcome to Joe Perks Platform! 🎉

This checklist will help you get up and running with the Joe Perks multi-tenant coffee fundraising marketplace.

## 📋 Pre-Setup Checklist

### **System Requirements**
- [ ] **Node.js 20 LTS** installed (`node -v` should show v20.x.x)
- [ ] **pnpm 9+** installed (`pnpm -v` should show 9.x.x or higher)
- [ ] **Git** installed and configured
- [ ] **VS Code** or preferred IDE installed
- [ ] **Terminal/Command Line** access

### **Account Access**
- [ ] **GitHub** access to the repository
- [ ] **Supabase** project access (if needed)
- [ ] **Vercel** team access (for deployment)
- [ ] **Slack/Discord** team communication access

## 🚀 Setup Process

### **Step 1: Repository Setup**
```bash
# Clone the repository
git clone <repository-url>
cd joeperks_platform

# Install dependencies
pnpm install

# Verify Nx workspace
pnpm nx --version
```

- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors
- [ ] Nx CLI working

### **Step 2: Environment Configuration**
```bash
# Copy environment template
cp config/environments/.env.local.example apps/medusa-server/.env

# Generate development secrets (if needed)
./scripts/generate-secrets.sh development
```

- [ ] Environment file created
- [ ] Database credentials configured (ask team lead)
- [ ] Secrets generated and configured

### **Step 3: Database Setup**
```bash
# Test database connection
cd apps/medusa-server
pnpm exec medusa db:migrate
```

- [ ] Database connection successful
- [ ] Migrations completed
- [ ] No critical errors in migration output

### **Step 4: Development Server Verification**
```bash
# Start backend server
pnpm nx serve medusa-server

# In another terminal, start frontend app
pnpm nx serve storefront-customer
```

- [ ] Medusa server starts on port 9000
- [ ] Customer app starts on port 3000
- [ ] No build errors
- [ ] Hot reload working

### **Step 5: Build Verification**
```bash
# Test all builds
pnpm nx run-many -t build

# Test specific project
pnpm nx build storefront-customer
```

- [ ] All projects build successfully
- [ ] No TypeScript errors
- [ ] Build artifacts generated

## 🔧 IDE Setup

### **VS Code Extensions (Recommended)**
- [ ] **Nx Console** - Nx workspace management
- [ ] **ESLint** - Code linting
- [ ] **Prettier** - Code formatting
- [ ] **TypeScript Hero** - TypeScript utilities
- [ ] **GitLens** - Git integration
- [ ] **Auto Rename Tag** - HTML/JSX tag renaming
- [ ] **Bracket Pair Colorizer** - Bracket matching

### **IDE Configuration**
```json
// .vscode/settings.json (create if doesn't exist)
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "nx.enableTelemetry": false
}
```

- [ ] Extensions installed
- [ ] Settings configured
- [ ] Auto-formatting working

## 📚 Knowledge Base

### **Required Reading**
- [ ] **README.md** - Project overview
- [ ] **docs/prd.md** - Product requirements
- [ ] **docs/architecture.md** - Technical architecture
- [ ] **docs/setup/README.md** - Setup documentation
- [ ] **docs/greenfield/README.md** - Build guide overview

### **Architecture Understanding**
- [ ] Understand the 4 Next.js applications and their purposes
- [ ] Understand Medusa v2 backend structure
- [ ] Understand shared libraries concept
- [ ] Understand multi-tenant security model
- [ ] Understand the marketplace business model

### **Development Workflow**
- [ ] Understand Nx workspace commands
- [ ] Understand monorepo structure
- [ ] Understand Git workflow (feature branches)
- [ ] Understand testing approach
- [ ] Understand deployment process

## 🛠️ Development Tasks

### **First Development Task**
Choose one to get familiar with the codebase:

**Option A: Frontend Task**
- [ ] Add a simple component to `libs/shared-ui`
- [ ] Use the component in `apps/storefront-customer`
- [ ] Verify hot reload and build process

**Option B: Backend Task**
- [ ] Add a simple API route to `apps/medusa-server/src/api`
- [ ] Test the endpoint with curl or Postman
- [ ] Verify database interaction

**Option C: Documentation Task**
- [ ] Review and improve existing documentation
- [ ] Add missing details you discovered during setup
- [ ] Create or update architectural diagrams

### **Code Quality Verification**
```bash
# Run linting
pnpm nx run-many -t lint

# Run tests
pnpm nx run-many -t test

# Check TypeScript
pnpm nx run-many -t type-check
```

- [ ] No linting errors
- [ ] All tests passing
- [ ] No TypeScript errors

## 🔍 Troubleshooting

### **Common Issues & Solutions**

**Port Already in Use**
```bash
# Find process using port
lsof -i :9000
# Kill process
kill -9 <PID>
```

**Node Modules Issues**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Nx Cache Issues**
```bash
# Clear Nx cache
pnpm nx reset
```

**Database Connection Issues**
- Check environment variables in `.env`
- Verify Supabase credentials with team lead
- Test connection manually

### **Getting Help**
- [ ] **Team Lead**: For access and credentials
- [ ] **Documentation**: Check `docs/` folder first
- [ ] **GitHub Issues**: Search existing issues
- [ ] **Team Chat**: Ask in development channel

## ✅ Onboarding Complete

### **Final Verification**
- [ ] Can start all development servers
- [ ] Can build all projects successfully
- [ ] Can run tests without errors
- [ ] Can make a simple code change and see it reflected
- [ ] Understand the project structure and architecture
- [ ] Know where to find documentation and help

### **Next Steps**
- [ ] **Join team standup** - Get assigned to first task
- [ ] **Review current sprint** - Understand current priorities
- [ ] **Set up development workflow** - Branch naming, PR process
- [ ] **Explore codebase** - Get familiar with existing code
- [ ] **Read pending stories** - Understand upcoming features

## 📞 Contacts

| Role | Contact | Purpose |
|------|---------|---------|
| **Tech Lead** | [Name/Email] | Architecture decisions, code reviews |
| **DevOps** | [Name/Email] | Deployment, infrastructure |
| **Product Manager** | [Name/Email] | Requirements, priorities |
| **Team Lead** | [Name/Email] | Task assignment, process |

## 🎯 Success Criteria

You're ready to contribute when you can:
- [ ] Start the development environment independently
- [ ] Make a code change and see it reflected in the browser
- [ ] Run tests and builds successfully
- [ ] Understand the multi-tenant architecture
- [ ] Navigate the monorepo structure confidently
- [ ] Know where to find documentation and help

---

**Welcome to the team! 🚀**

If you encounter any issues during onboarding, don't hesitate to ask for help. We're here to support you in becoming productive quickly while maintaining our high standards for code quality and security.
