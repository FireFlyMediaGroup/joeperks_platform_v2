# High Level Architecture

## Technical Summary
The system employs a microservices-oriented architecture built on Medusa.js with custom multi-tenant extensions. The platform uses a hub-and-spoke model where organizations create branded storefronts, roasters manage fulfillment, and the platform orchestrates payments through Stripe Connect. Key architectural patterns include multi-tenant data isolation, event-driven workflows for approvals and fulfillment, and automated revenue splitting with comprehensive audit trails.

## High Level Overview
The platform consists of three main application layers:
1. **Organization Storefronts**: Dynamic Next.js applications with custom branding
2. **Admin Dashboards**: React-based management interfaces for all user types
3. **API Layer**: Extended Medusa.js backend with custom business logic

The system integrates with Stripe Connect for payments, shipping APIs for fulfillment, and geographic services for roaster-organization matching. All data is stored in PostgreSQL with Redis caching for performance.

## Repository Structure
**Structure**: Monorepo with Nx workspace
**Monorepo Tool**: Nx for build optimization and dependency management
**Package Organization**: Apps (storefronts, admin, api) and shared libraries (ui-components, business-logic, types)

## High Level Architecture Diagram
```mermaid
graph TB
    subgraph "Frontend Applications"
        A[Organization Storefronts<br/>Next.js]
        B[Admin Dashboard<br/>React]
        C[Roaster Portal<br/>React]
    end
    
    subgraph "API Layer"
        D[Medusa.js Core<br/>Extended]
        E[Custom Services<br/>Business Logic]
        F[Authentication<br/>JWT + RBAC]
    end
    
    subgraph "External Services"
        G[Stripe Connect<br/>Payments]
        H[Shipping APIs<br/>Fulfillment]
        I[Geographic APIs<br/>Matching]
        J[Email/SMS<br/>Notifications]
    end
    
    subgraph "Data Layer"
        K[PostgreSQL<br/>Primary DB]
        L[Redis<br/>Cache/Sessions]
        M[File Storage<br/>Assets]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    E --> G
    E --> H
    E --> I
    E --> J
    D --> K
    D --> L
    E --> M
```
