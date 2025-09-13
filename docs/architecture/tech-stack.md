# Tech Stack

## Monorepo Management
- **Build System**: Nx 21.4+ for monorepo orchestration and build optimization
- **Package Manager**: npm workspaces with dependency hoisting
- **Code Sharing**: Shared TypeScript libraries (`libs/`) across applications

## Backend Technologies
- **Framework**: Medusa.js v2.10+ with TypeScript
- **Runtime**: Node.js 20+ with Express.js
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Cache**: Redis 7+ for sessions and performance
- **Authentication**: Kinde Auth with multi-tenant organizations and RBAC
- **API Style**: REST with GraphQL for complex queries

## Frontend Technologies
- **Organization Storefronts**: Next.js 14+ with App Router
- **Admin Interfaces**: React 18+ with Vite build system
- **UI Framework**: Tailwind CSS with Headless UI components
- **State Management**: Zustand for client state, React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics dashboards
- **Authentication**: Kinde React SDK with organization context

## Infrastructure & DevOps
- **Hosting**: Railway/Vercel hybrid (API on Railway, storefronts on Vercel)
- **Database**: Neon PostgreSQL with connection pooling and branch support
- **Cache**: Redis Cloud or Railway Redis
- **CDN**: Vercel Edge Network for static assets
- **Monitoring**: Vercel Analytics and Railway metrics
- **CI/CD**: GitHub Actions with Nx-optimized caching and automated testing

## External Integrations
- **Authentication**: Kinde for multi-tenant auth, RBAC, and feature flags
- **Payments**: Stripe Connect for multi-party transactions
- **Shipping**: ShipStation API + individual roaster APIs
- **Geographic**: Google Maps API for geocoding and distance
- **Email**: SendGrid for transactional emails
- **SMS**: Twilio for urgent notifications
- **Analytics**: Mixpanel for user behavior tracking
