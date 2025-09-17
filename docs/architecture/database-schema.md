# Database Schema

```sql
-- Core user management (integrates with Stytch)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stytch_user_id VARCHAR(255) UNIQUE NOT NULL, -- Stytch user identifier
    email VARCHAR(255) UNIQUE NOT NULL,
    given_name VARCHAR(255),
    family_name VARCHAR(255),
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('platform_admin', 'roaster', 'organization', 'customer')),
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations with Stytch integration
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stytch_org_id VARCHAR(255) UNIQUE NOT NULL, -- Stytch organization ID
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tax_id VARCHAR(255), -- encrypted
    business_address JSONB NOT NULL,
    coordinates POINT, -- PostGIS for geographic queries
    roaster_id UUID REFERENCES roasters(id),
    status VARCHAR(50) DEFAULT 'pending',
    branding JSONB DEFAULT '{}',
    fundraising_settings JSONB DEFAULT '{}',
    feature_flags JSONB DEFAULT '{}', -- Cached from Stytch for performance
    stripe_connect_account_id VARCHAR(255),
    total_raised DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization members (synced with Stytch)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    stytch_membership_id VARCHAR(255), -- Stytch membership identifier
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'campaign_manager', 'viewer')),
    permissions JSONB DEFAULT '[]', -- Cached permissions for performance
    status VARCHAR(50) DEFAULT 'active',
    invited_at TIMESTAMP,
    joined_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- Individual campaigns under organizations
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('time_based', 'amount_based', 'ongoing')),
    goal_amount DECIMAL(10,2),
    end_date DATE,
    status VARCHAR(50) DEFAULT 'draft',
    current_raised DECIMAL(10,2) DEFAULT 0,
    storefront_active BOOLEAN DEFAULT false,
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, slug)
);

-- Coffee roasters with Stytch integration
CREATE TABLE roasters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stytch_org_id VARCHAR(255) UNIQUE NOT NULL, -- Stytch organization ID for roaster
    business_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    business_address JSONB NOT NULL,
    coordinates POINT, -- PostGIS for distance calculations
    service_radius INTEGER, -- miles, null for national
    is_national BOOLEAN DEFAULT false,
    stripe_connect_account_id VARCHAR(255),
    approval_settings JSONB DEFAULT '{}',
    capacity_limit INTEGER DEFAULT 50,
    current_partnerships INTEGER DEFAULT 0,
    shipping_settings JSONB DEFAULT '{}',
    feature_flags JSONB DEFAULT '{}', -- Cached from Stytch
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product catalog managed by roasters
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roaster_id UUID REFERENCES roasters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    retail_price DECIMAL(8,2) NOT NULL,
    wholesale_price DECIMAL(8,2) NOT NULL,
    weight DECIMAL(6,2), -- for shipping calculations
    inventory_tracked BOOLEAN DEFAULT false,
    current_inventory INTEGER,
    is_active BOOLEAN DEFAULT true,
    product_images JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partnership approval workflow
CREATE TABLE roaster_approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    roaster_id UUID REFERENCES roasters(id),
    status VARCHAR(50) DEFAULT 'pending',
    organization_data JSONB NOT NULL, -- snapshot of org data at request time
    decision_notes TEXT,
    decided_by UUID REFERENCES users(id),
    decided_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders with revenue splitting
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    customer_id UUID REFERENCES customers(id),
    roaster_id UUID REFERENCES roasters(id),
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(8,2) NOT NULL,
    fundraising_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(8,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    tracking_number VARCHAR(255),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue tracking and audit trail
CREATE TABLE fundraising_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    organization_id UUID REFERENCES organizations(id),
    campaign_id UUID REFERENCES campaigns(id),
    roaster_id UUID REFERENCES roasters(id),
    total_amount DECIMAL(10,2) NOT NULL,
    roaster_amount DECIMAL(10,2) NOT NULL,
    organization_amount DECIMAL(10,2) NOT NULL,
    platform_amount DECIMAL(10,2) NOT NULL,
    stripe_transfer_ids JSONB, -- array of Stripe transfer IDs
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer authentication sessions (for guest checkout)
CREATE TABLE customer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stytch_session_id VARCHAR(255) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    session_data JSONB DEFAULT '{}',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_stytch_id ON users(stytch_user_id);
CREATE INDEX idx_organizations_stytch_org_id ON organizations(stytch_org_id);
CREATE INDEX idx_org_members_org_user ON organization_members(organization_id, user_id);
CREATE INDEX idx_customer_sessions_stytch ON customer_sessions(stytch_session_id);
CREATE INDEX idx_customer_sessions_expires ON customer_sessions(expires_at);
CREATE INDEX idx_organizations_roaster ON organizations(roaster_id);
CREATE INDEX idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX idx_orders_campaign ON orders(campaign_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_roaster ON products(roaster_id);
CREATE INDEX idx_approval_requests_roaster ON roaster_approval_requests(roaster_id);
CREATE INDEX idx_approval_requests_status ON roaster_approval_requests(status);

-- Geographic indexes for PostGIS
CREATE INDEX idx_organizations_coordinates ON organizations USING GIST(coordinates);
CREATE INDEX idx_roasters_coordinates ON roasters USING GIST(coordinates);
```
