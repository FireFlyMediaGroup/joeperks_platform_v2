# Components

## Authentication Service
**Primary Responsibility**: Multi-tenant user authentication, authorization, and organization management
**Key Interfaces**:
- `/auth/login` - Stytch login (email/password or magic link) and session establishment
- `/auth/validate` - Token validation and role resolution
- `/auth/organizations/{id}/invite` - Organization member invitation workflow
- `/auth/vendors/login` - Vendor admin authentication (custom actor type)
**Dependencies**: Stytch API, organization management service, Redis for session caching
**Technology**: Stytch with multi-tenant RBAC; vendor admins use a custom Medusa actor type

**Key Features**:
- **Multi-tenant Organizations**: Each fundraising organization is scoped in app context; vendor admins are modeled via a custom Medusa actor type
- **Role-Based Access Control**: platform_admin, vendor_admin, org_admin, customer roles with granular permissions
- **Member Management**: Streamlined invitation and role assignment workflows
- **Session Management**: Secure JWT tokens with claims for `org_id`, `actor_type`, and optional `vendor_id`

## Marketplace Module (Vendor Management)
**Primary Responsibility**: Native Medusa v2 marketplace using modules, workflows, and module links (no external plugin)
**Key Interfaces**:
- `/vendors` (POST) - Create vendor + admin via create-vendor workflow
- `/vendors/products` - Vendor product management (planned)
- `/vendors/orders` - Vendor order retrieval (planned)
**Dependencies**: MarketplaceModuleService, links to Product and Order modules, Authentication (vendor actor type)
**Technology**: Custom Medusa module with `Vendor` and `VendorAdmin` models; module links `vendor↔product` and `vendor↔order`; workflows with compensation (e.g., create-vendor)

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
