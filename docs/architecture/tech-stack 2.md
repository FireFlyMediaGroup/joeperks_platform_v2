# Tech Stack

## Backend Technologies
- **Framework**: Medusa.js v1.20+ with TypeScript
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 14+ with TypeORM
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
- **Hosting**: AWS/Vercel hybrid (API on AWS, storefronts on Vercel)
- **Database**: AWS RDS PostgreSQL with read replicas
- **Cache**: AWS ElastiCache Redis
- **CDN**: CloudFront for static assets
- **Monitoring**: DataDog for APM and error tracking
- **CI/CD**: GitHub Actions with automated testing

## External Integrations
- **Authentication**: Kinde for multi-tenant auth, RBAC, and feature flags
- **Payments**: Stripe Connect for multi-party transactions
- **Shipping**: ShipStation API + individual roaster APIs
- **Geographic**: Google Maps API for geocoding and distance
- **Email**: SendGrid for transactional emails
- **SMS**: Twilio for urgent notifications
- **Analytics**: Mixpanel for user behavior tracking
