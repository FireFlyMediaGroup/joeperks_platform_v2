s
# Data Models

## Organization
**Purpose**: Represents fundraising entities that run multiple campaigns

**Key Attributes**:
- `id`: UUID - Primary identifier
- `name`: String - Organization display name
- `slug`: String - URL-friendly identifier for storefronts
- `tax_id`: String - Tax identification number (encrypted)
- `status`: Enum - active, pending, suspended, inactive
- `roaster_id`: UUID - Associated roaster for fulfillment
- `branding`: JSON - Logo, colors, messaging customization
- `fundraising_settings`: JSON - Default campaign settings
- `created_at`: Timestamp - Registration date

**Relationships**:
- Has many campaigns (one-to-many)
- Belongs to one roaster (many-to-one, after approval)
- Has many orders through campaigns

## Campaign
**Purpose**: Individual fundraising initiatives under an organization

**Key Attributes**:
- `id`: UUID - Primary identifier
- `organization_id`: UUID - Parent organization
- `name`: String - Campaign name (e.g., "Volleyball Team 2024")
- `slug`: String - URL segment for campaign-specific pages
- `goal_type`: Enum - time_based, amount_based, ongoing
- `goal_amount`: Decimal - Target fundraising amount (if amount_based)
- `end_date`: Date - Campaign end date (if time_based)
- `status`: Enum - draft, active, paused, completed, cancelled
- `current_raised`: Decimal - Running total of funds raised
- `storefront_active`: Boolean - Whether storefront accepts orders

**Relationships**:
- Belongs to one organization (many-to-one)
- Has many orders (one-to-many)
- Has campaign-specific branding and messaging

## Roaster
**Purpose**: Coffee providers who fulfill orders and manage product catalogs

**Key Attributes**:
- `id`: UUID - Primary identifier
- `business_name`: String - Legal business name
- `display_name`: String - Public-facing name
- `address`: JSON - Complete business address with coordinates
- `service_radius`: Integer - Service area in miles (null for national)
- `is_national`: Boolean - Can serve any location
- `stripe_connect_id`: String - Stripe Connect account identifier
- `approval_settings`: JSON - Auto-approval criteria and preferences
- `capacity_limit`: Integer - Maximum concurrent partnerships
- `current_partnerships`: Integer - Active organization count
- `status`: Enum - active, pending, suspended, inactive

**Relationships**:
- Has many organizations (one-to-many, after approval)
- Has many products (one-to-many)
- Has many shipping configurations (one-to-many)

## Product
**Purpose**: Coffee products available for sale through organization storefronts

**Key Attributes**:
- `id`: UUID - Primary identifier
- `roaster_id`: UUID - Owning roaster
- `name`: String - Product name
- `description`: Text - Product description
- `retail_price`: Decimal - Customer-facing price
- `wholesale_price`: Decimal - Roaster cost basis
- `weight`: Decimal - Product weight for shipping
- `inventory_tracked`: Boolean - Whether to track inventory
- `current_inventory`: Integer - Available quantity (if tracked)
- `is_active`: Boolean - Available for sale
- `product_images`: JSON - Array of image URLs

**Relationships**:
- Belongs to one roaster (many-to-one)
- Has many order line items (one-to-many)

## Order
**Purpose**: Customer purchases with multi-party payment splitting

**Key Attributes**:
- `id`: UUID - Primary identifier
- `campaign_id`: UUID - Associated campaign
- `customer_id`: UUID - Purchasing customer
- `roaster_id`: UUID - Fulfilling roaster
- `status`: Enum - pending, paid, processing, shipped, delivered, cancelled
- `subtotal`: Decimal - Product total before fees
- `shipping_cost`: Decimal - Shipping charges
- `fundraising_amount`: Decimal - Amount going to organization
- `platform_fee`: Decimal - Platform transaction fee
- `total_amount`: Decimal - Total charged to customer
- `stripe_payment_intent_id`: String - Stripe payment reference
- `tracking_number`: String - Shipment tracking
- `shipped_at`: Timestamp - Fulfillment date

**Relationships**:
- Belongs to one campaign (many-to-one)
- Belongs to one customer (many-to-one)
- Belongs to one roaster (many-to-one)
- Has many line items (one-to-many)
