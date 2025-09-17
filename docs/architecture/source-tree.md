
# Source Tree

```
coffee-fundraising-platform/
├── apps/
│   ├── api/                          # Medusa.js backend
│   │   ├── src/
│   │   │   ├── api/                  # Custom API routes
│   │   │   │   ├── auth/             # Stytch authentication endpoints
│   │   │   │   │   ├── callback.ts   # OAuth callback handler
│   │   │   │   │   ├── login.ts      # Authentication initiation
│   │   │   │   │   ├── validate.ts   # Session validation
│   │   │   │   │   └── webhooks.ts   # Stytch webhook handlers
│   │   │   ├── services/             # Business logic services
│   │   │   │   ├── auth.service.ts   # Stytch integration service
│   │   │   │   ├── organization.service.ts
│   │   │   │   ├── campaign.service.ts
│   │   │   │   └── feature-flag.service.ts
│   │   │   ├── middleware/           # Request middleware
│   │   │   │   ├── auth.middleware.ts # Stytch token validation
│   │   │   │   ├── rbac.middleware.ts # Role-based access control
│   │   │   │   └── tenant.middleware.ts # Multi-tenant isolation
│   │   │   ├── models/               # Database entities
│   │   │   ├── subscribers/          # Event handlers
│   │   │   └── migrations/           # Database migrations
│   │   ├── medusa-config.js          # Medusa configuration
│   │   └── package.json
│   │
│   ├── storefront/                   # Organization storefronts
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router
│   │   │   │   ├── [orgSlug]/        # Dynamic organization routes
│   │   │   │   │   ├── auth/         # Stytch auth callbacks
│   │   │   │   │   │   ├── callback/
│   │   │   │   │   │   └── login/
│   │   │   │   ├── campaign/         # Campaign-specific pages
│   │   │   │   └── checkout/         # Purchase flow with auth
│   │   │   ├── components/           # Storefront components
│   │   │   │   ├── auth/             # Authentication components
│   │   │   │   │   ├── LoginButton.tsx
│   │   │   │   │   ├── UserProfile.tsx
│   │   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── lib/                  # API clients and utilities
│   │   │   │   ├── stytch.ts         # Stytch client configuration
│   │   │   │   └── auth-context.tsx  # React context for auth
│   │   │   └── styles/               # Tailwind CSS
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   ├── admin-dashboard/              # Platform admin interface
│   │   ├── src/
│   │   │   ├── pages/                # Admin pages
│   │   │   │   ├── auth/             # Admin authentication
│   │   │   │   ├── organizations/    # Organization management
│   │   │   │   │   ├── [id]/members/ # Member management
│   │   │   │   │   └── [id]/features/ # Feature flag management
│   │   │   │   ├── roasters/         # Roaster management
│   │   │   │   ├── orders/           # Order monitoring
│   │   │   │   └── analytics/        # Platform metrics
│   │   │   ├── components/           # Admin UI components
│   │   │   │   ├── auth/             # Stytch auth components
│   │   │   │   └── rbac/             # Role-based UI components
│   │   │   └── hooks/                # Custom React hooks
│   │   │       ├── useStytchAuth.ts   # Stytch authentication hook
│   │   │       └── useFeatureFlags.ts # Feature flag hook
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── roaster-portal/               # Roaster management interface
│       ├── src/
│       │   ├── pages/
│       │   │   ├── auth/             # Roaster authentication
│       │   │   ├── partnerships/     # Approval workflow
│       │   │   │   └── [orgId]/      # Organization-specific views
│       │   │   ├── products/         # Catalog management
│       │   │   ├── orders/           # Fulfillment dashboard
│       │   │   └── analytics/        # Performance metrics
│       │   ├── components/
│       │   │   └── auth/             # Stytch auth components
│       │   └── hooks/
│       │       └── useRoasterAuth.ts # Roaster-specific auth hook
│       ├── vite.config.ts
│       └── package.json
│
├── libs/
│   ├── shared-types/                 # TypeScript definitions
│   │   ├── src/
│   │   │   ├── auth/                 # Authentication types
│   │   │   │   ├── stytch.types.ts    # Stytch-specific types
│   │   │   │   ├── user.types.ts     # User and role types
│   │   │   │   └── organization.types.ts
│   │   │   ├── api/                  # API request/response types
│   │   │   ├── database/             # Database entity types
│   │   │   └── features/             # Feature flag types
│   │   └── package.json
│   │
│   ├── auth-utils/                   # Authentication utilities
│   │   ├── src/
│   │   │   ├── stytch-client.ts       # Stytch API client
│   │   │   ├── token-validation.ts   # JWT validation utilities
│   │   │   ├── rbac-helpers.ts       # Role/permission helpers
│   │   │   └── feature-flags.ts      # Feature flag utilities
│   │   └── package.json
│   │
│   ├── ui-components/                # Shared UI components
│   │   ├── src/
│   │   │   ├── auth/                 # Authentication UI components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── UserMenu.tsx
│   │   │   │   └── RoleGuard.tsx
│   │   │   └── forms/                # Form components
│   │   └── package.json
│   │
│   └── api-client/                   # API client library
│       ├── src/
│       │   ├── clients/              # HTTP clients
│       │   │   ├── auth-client.ts    # Authentication API client
│       │   │   └── platform-client.ts
│       │   ├── hooks/                # React Query hooks
│       │   │   ├── useAuth.ts        # Authentication hooks
│       │   │   └── useOrganization.ts
│       │   └── types/                # Request/response types
│       └── package.json
│
├── tools/
│   ├── database/                     # Database utilities
│   │   ├── migrations/               # SQL migration files
│   │   ├── seeds/                    # Test data
│   │   └── scripts/                  # Maintenance scripts
│   │
│   └── deployment/                   # Deployment configurations
│       ├── docker/                   # Container definitions
│       ├── terraform/                # Infrastructure as code
│       └── github-actions/           # CI/CD workflows
│
├── docs/                             # Documentation
│   ├── api/                          # API documentation
│   ├── deployment/                   # Deployment guides
│   └── user-guides/                  # User documentation
│
├── nx.json                           # Nx workspace configuration
├── package.json                      # Root package.json
├── tsconfig.base.json                # Base TypeScript config
└── README.md                         # Project overview
```
// apps/storefront/src/middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Handle joeperks.com subdomains
  if (hostname.endsWith('.joeperks.com')) {
    const orgSlug = hostname.replace('.joeperks.com', '');
    
    // Rewrite to dynamic route
    url.pathname = `/${orgSlug}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}
