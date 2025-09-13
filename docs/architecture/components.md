# Components

## Authentication Service
**Primary Responsibility**: Multi-tenant user authentication, authorization, and organization management
**Key Interfaces**:
- `/auth/login` - Kinde OAuth flow initiation with organization context
- `/auth/callback` - OAuth callback handling and session establishment
- `/auth/validate` - Token validation with role and feature flag resolution
- `/auth/organizations/{id}/invite` - Organization member invitation workflow
**Dependencies**: Kinde Auth API, organization management service, Redis for session caching
**Technology**: Kinde Auth with organization-based multi-tenancy, built-in feature flags, and granular RBAC

**Key Features**:
- **Multi-tenant Organizations**: Each fundraising organization maps to a Kinde organization
- **Role-Based Access Control**: Admin, campaign_manager, viewer roles with granular permissions
- **Feature Flags**: Built-in feature gating for campaign types, payment methods, and roaster features
- **Member Management**: Streamlined invitation and role assignment workflows
- **Session Management**: Secure JWT tokens with organization context and feature flag claims

## Organization Management Service
**Primary Responsibility**: Organization onboarding, campaign management, and storefront configuration
**Key Interfaces**:
- `/organizations` - CRUD operations for organization data
- `/organizations/{id}/campaigns` - Campaign management
- `/organizations/{id}/storefront` - Branding and customization
**Dependencies**: Roaster service for partnership requests, payment service for Stripe setup
**Technology**: Custom Medusa.js services with PostgreSQL storage

## Roaster Management Service
**Primary Responsibility**: Roaster onboarding, product catalog, and partnership approvals
**Key Interfaces**:
- `/roasters` - Roaster profile and business information
- `/roasters/{id}/products` - Product catalog management
- `/roasters/{id}/partnerships` - Organization approval workflow
**Dependencies**: Geographic service for service area validation, payment service for Connect setup
**Technology**: Extended Medusa.js entities with custom approval workflows

## Payment Processing Service
**Primary Responsibility**: Multi-party payment processing and revenue splitting
**Key Interfaces**:
- `/payments/process` - Order payment with automatic splits
- `/payments/transfers` - Revenue distribution to roasters and organizations
- `/payments/webhooks` - Stripe webhook handling
**Dependencies**: Stripe Connect API, order management service
**Technology**: Stripe Connect with Express accounts, webhook validation

## Geographic Matching Service
**Primary Responsibility**: Location-based roaster-organization matching and service area validation
**Key Interfaces**:
- `/geographic/match` - Find available roasters for organization location
- `/geographic/validate` - Verify service area coverage
- `/geographic/distance` - Calculate distances between locations
**Dependencies**: Google Maps API for geocoding, roaster service for service areas
**Technology**: PostGIS for geographic queries, Google Maps API integration

## Order Fulfillment Service
**Primary Responsibility**: Order processing, document generation, and shipment tracking
**Key Interfaces**:
- `/fulfillment/orders` - Order processing and routing
- `/fulfillment/documents` - Invoice, label, and packing slip generation
- `/fulfillment/tracking` - Shipment status updates
**Dependencies**: Shipping APIs, document generation service, notification service
**Technology**: PDF generation libraries, shipping API integrations

## Notification Service
**Primary Responsibility**: Email, SMS, and in-app notifications for all user types
**Key Interfaces**:
- `/notifications/email` - Transactional email sending
- `/notifications/sms` - SMS notifications for urgent updates
- `/notifications/templates` - Notification template management
**Dependencies**: SendGrid for email, Twilio for SMS
**Technology**: Template-based notification system with user preferences
