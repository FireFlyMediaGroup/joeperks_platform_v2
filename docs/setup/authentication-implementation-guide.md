# Authentication Implementation Guide

## Quick Start for Developers

This guide provides step-by-step instructions for developers working with the Joe Perks authentication system.

## 🚀 Getting Started

### 1. Environment Setup

```bash
# 1. Install dependencies (already done)
pnpm install

# 2. Build shared libraries
pnpm nx build shared-types shared-utils

# 3. Test authentication configuration
pnpm nx auth:test medusa-server

# 4. Start the development server
pnpm nx serve medusa-server
```

### 2. Stytch Project Setup (Required)

1. **Create Stytch Account**: Go to https://stytch.com and sign up
2. **Create Project**: Create a new project called `joeperks-development`
3. **Get Credentials**: Copy these values from your dashboard:
   - Project ID (starts with `project-test-`)
   - Secret (starts with `secret-test-`)
   - Public Token (starts with `public-token-test-`)

4. **Update Environment Files**:
   ```bash
   # apps/medusa-server/.env
   STYTCH_PROJECT_ID=project-test-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   STYTCH_SECRET=secret-test-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   # All Next.js apps (.env.local)
   NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=public-token-test-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   STYTCH_PROJECT_ID=project-test-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   STYTCH_SECRET=secret-test-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## 🏗️ Architecture Overview

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   Applications  │    │   Services      │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Storefront    │───▶│ • Auth Service  │───▶│ • Stytch API    │
│ • Admin Panel   │    │ • Auth Middleware│    │ • Redis Cache   │
│ • Org Dashboard │    │ • API Routes    │    │ • PostgreSQL    │
│ • Roaster Portal│    │ • RBAC System   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as Stytch
    participant R as Redis

    U->>F: Login Request
    F->>B: POST /auth/login
    B->>S: Validate Credentials
    S->>B: User Data + Session
    B->>R: Store Session
    B->>F: JWT Token + User Context
    F->>U: Redirect to Dashboard
    
    Note over F,B: Subsequent Requests
    F->>B: API Request + JWT
    B->>B: Validate Token & Check Permissions
    B->>F: Protected Resource
```

## 🔐 RBAC System Implementation

### Role Definitions

```typescript
// Location: libs/shared-types/src/auth.ts
enum UserRole {
  PLATFORM_ADMIN = 'platform_admin',        // Full system access
  ORGANIZATION_ADMIN = 'organization_admin', // Organization management
  CAMPAIGN_MANAGER = 'campaign_manager',     // Campaign operations
  ORGANIZATION_VIEWER = 'organization_viewer', // Read-only access
  ROASTER_ADMIN = 'roaster_admin',          // Roaster management
  ROASTER_STAFF = 'roaster_staff',          // Order fulfillment
  CUSTOMER = 'customer'                      // Purchase access
}
```

### Permission System

```typescript
// Core permissions
enum Permission {
  // Platform
  MANAGE_PLATFORM = 'manage_platform',
  VIEW_PLATFORM_ANALYTICS = 'view_platform_analytics',
  MANAGE_USERS = 'manage_users',
  
  // Organization
  MANAGE_ORGANIZATION = 'manage_organization',
  CREATE_CAMPAIGNS = 'create_campaigns',
  MANAGE_CAMPAIGNS = 'manage_campaigns',
  VIEW_ORGANIZATION_ANALYTICS = 'view_organization_analytics',
  INVITE_ORGANIZATION_MEMBERS = 'invite_organization_members',
  
  // Roaster
  MANAGE_ROASTER = 'manage_roaster',
  MANAGE_PRODUCTS = 'manage_products',
  FULFILL_ORDERS = 'fulfill_orders',
  VIEW_ROASTER_ANALYTICS = 'view_roaster_analytics',
  
  // Customer
  PLACE_ORDERS = 'place_orders',
  VIEW_ORDER_HISTORY = 'view_order_history',
  MANAGE_PROFILE = 'manage_profile'
}
```

### Multi-Tenant Access Control

```typescript
// Organization-level isolation
function canAccessOrganization(user: StytchUserContext, orgId: string): boolean {
  // Platform admins can access any organization
  if (hasRole(user, UserRole.PLATFORM_ADMIN)) {
    return true
  }
  
  // Users can only access their own organization
  return user.organizationId === orgId
}

// Usage in middleware
app.get('/org/:orgId/campaigns', 
  createAuthMiddleware({
    required: true,
    roles: [UserRole.ORGANIZATION_ADMIN, UserRole.CAMPAIGN_MANAGER],
    organizationAccess: true
  }),
  getCampaignsHandler
)
```

## 🛠️ Backend Implementation

### Authentication Service

**File**: `apps/medusa-server/src/services/auth.service.ts`

```typescript
export class StytchAuthService {
  private client: StytchClient

  constructor(config: StytchConfig) {
    this.client = new StytchClient({
      project_id: config.projectId,
      secret: config.secret,
      env: config.environment
    })
  }

  // Core methods
  async validateToken(token: string): Promise<TokenValidationResult>
  async createSession(email: string, password: string): Promise<TokenValidationResult>
  async revokeSession(sessionToken: string): Promise<boolean>
  
  // RBAC helpers
  hasRole(user: StytchUserContext, role: UserRole): boolean
  hasPermission(user: StytchUserContext, permission: Permission): boolean
  canAccessOrganization(user: StytchUserContext, orgId: string): boolean
}
```

### Express Middleware

**File**: `apps/medusa-server/src/middleware/auth.middleware.ts`

```typescript
// Pre-built middleware functions
export const requireAuth = createAuthMiddleware({ required: true })
export const requirePlatformAdmin = createAuthMiddleware({
  required: true,
  roles: [UserRole.PLATFORM_ADMIN]
})
export const requireOrganizationAdmin = createAuthMiddleware({
  required: true,
  roles: [UserRole.ORGANIZATION_ADMIN, UserRole.PLATFORM_ADMIN],
  organizationAccess: true
})

// Usage in routes
app.get('/admin/users', requirePlatformAdmin, getUsersHandler)
app.get('/org/:orgId/campaigns', requireOrganizationAdmin, getCampaignsHandler)
```

### API Routes

**Files**: `apps/medusa-server/src/api/auth/`

```typescript
// POST /auth/login
export async function POST(req: Request, res: Response) {
  const { email, password, organizationId } = req.body
  const authService = createStytchAuthService()
  
  const result = await authService.createSession(email, password)
  
  if (result.isValid && result.user) {
    // Set secure cookie
    res.cookie('stytch_session', result.user.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
    
    return res.json({
      sessionToken: result.user.sessionId,
      user: result.user,
      permissions: authService.getUserPermissions(result.user)
    })
  }
  
  return res.status(401).json({ error: 'Authentication failed' })
}
```

## 🎨 Frontend Integration

### React Hook Pattern

```typescript
// Custom authentication hook
function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  const login = async (email: string, password: string, orgId?: string) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, organizationId: orgId })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSession(createAuthSession(data.user))
        return { success: true, user: data.user }
      }
      
      return { success: false, error: 'Login failed' }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    await fetch('/auth/logout', { method: 'POST' })
    setSession(null)
  }

  const hasRole = (role: UserRole) => {
    return session?.user ? hasRoleUtil(session.user, role) : false
  }

  const hasPermission = (permission: Permission) => {
    return session?.user ? hasPermissionUtil(session.user, permission) : false
  }

  return { session, login, logout, hasRole, hasPermission, loading }
}
```

### Route Protection Component

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: Permission
  fallback?: React.ReactNode
}

function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallback = <AccessDenied /> 
}: ProtectedRouteProps) {
  const { session, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!session?.isAuthenticated) {
    return <LoginPage />
  }

  if (requiredRole && !hasRole(session.user, requiredRole)) {
    return fallback
  }

  if (requiredPermission && !hasPermission(session.user, requiredPermission)) {
    return fallback
  }

  return <>{children}</>
}

// Usage
function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole={UserRole.PLATFORM_ADMIN}>
      <AdminPanel />
    </ProtectedRoute>
  )
}
```

### Stytch React Integration

```typescript
// Stytch provider setup
import { StytchProvider } from '@stytch/nextjs'

function App({ Component, pageProps }: AppProps) {
  return (
    <StytchProvider stytch={stytch}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </StytchProvider>
  )
}

// Login component with Stytch
import { useStytchUser, useStytch } from '@stytch/nextjs'

function LoginForm() {
  const stytch = useStytch()
  const { user } = useStytchUser()

  const handleLogin = async (email: string, password: string) => {
    try {
      await stytch.passwords.authenticate({
        email,
        password,
        session_duration_minutes: 60 * 24 // 24 hours
      })
      
      // User is now authenticated
      // Redirect or update UI
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.target as HTMLFormElement)
      handleLogin(
        formData.get('email') as string,
        formData.get('password') as string
      )
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  )
}
```

## 🧪 Testing

### Unit Tests

```typescript
// Test authentication service
describe('StytchAuthService', () => {
  let authService: StytchAuthService

  beforeEach(() => {
    authService = new StytchAuthService({
      projectId: 'test-project',
      secret: 'test-secret',
      environment: 'test'
    })
  })

  it('should validate organization access correctly', () => {
    const user = createMockUser({
      roles: [UserRole.ORGANIZATION_ADMIN],
      organizationId: 'org-123'
    })

    expect(authService.canAccessOrganization(user, 'org-123')).toBe(true)
    expect(authService.canAccessOrganization(user, 'org-456')).toBe(false)
  })

  it('should check permissions correctly', () => {
    const user = createMockUser({
      roles: [UserRole.CAMPAIGN_MANAGER]
    })

    expect(authService.hasPermission(user, Permission.CREATE_CAMPAIGNS)).toBe(true)
    expect(authService.hasPermission(user, Permission.MANAGE_PLATFORM)).toBe(false)
  })
})
```

### Integration Tests

```typescript
// Test API endpoints
describe('Authentication API', () => {
  it('should authenticate valid users', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200)

    expect(response.body).toHaveProperty('sessionToken')
    expect(response.body).toHaveProperty('user')
    expect(response.body.user).toHaveProperty('roles')
  })

  it('should protect routes with middleware', async () => {
    await request(app)
      .get('/admin/users')
      .expect(401)

    const token = await getValidToken(UserRole.PLATFORM_ADMIN)
    
    await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
})
```

## 🔧 Configuration & Deployment

### Environment Variables

```bash
# Development
STYTCH_PROJECT_ID=project-test-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
STYTCH_SECRET=secret-test-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NODE_ENV=development

# Production
STYTCH_PROJECT_ID=project-live-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
STYTCH_SECRET=secret-live-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NODE_ENV=production
```

### Redis Configuration

```bash
# Session storage
REDIS_URL=redis://localhost:6379
# or for production
REDIS_URL=redis://user:password@host:port
```

### Database Setup

```sql
-- Add authentication columns to users table
ALTER TABLE users ADD COLUMN stytch_user_id VARCHAR UNIQUE;
ALTER TABLE users ADD COLUMN roles TEXT[] DEFAULT '{"customer"}';
ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN roaster_id UUID REFERENCES roasters(id);

-- Create indexes for performance
CREATE INDEX idx_users_stytch_id ON users(stytch_user_id);
CREATE INDEX idx_users_org_id ON users(organization_id);
CREATE INDEX idx_users_roaster_id ON users(roaster_id);
```

## 📚 Additional Resources

- **Stytch Documentation**: https://stytch.com/docs
- **RBAC Best Practices**: `docs/setup/stytch-auth-rbac-guide.md`
- **API Reference**: Generated from OpenAPI specs
- **Testing Guide**: `apps/medusa-server/src/__tests__/auth/`

## 🆘 Troubleshooting

### Common Issues

1. **Module not found errors**: Run `pnpm nx build shared-types shared-utils`
2. **Invalid token errors**: Check Stytch credentials in `.env`
3. **Permission denied**: Verify user roles in Stytch dashboard
4. **CORS errors**: Check `ADMIN_CORS` and `STORE_CORS` settings

### Debug Commands

```bash
# Test authentication setup
pnpm nx auth:test medusa-server

# Check server logs
pnpm nx serve medusa-server --verbose

# Validate environment
node -e "console.log(process.env.STYTCH_PROJECT_ID)"
```

This implementation guide provides everything needed to work with the Joe Perks authentication system. For specific questions, refer to the code examples and test cases in the repository.
