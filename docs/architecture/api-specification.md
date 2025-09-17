# API Specification

```yaml
openapi: 3.0.0
info:
  title: Coffee Fundraising Platform API
  version: 1.0.0
  description: Multi-tenant fundraising marketplace API
servers:
  - url: https://api.coffeefundraising.com/v1
    description: Production API
  - url: https://staging-api.coffeefundraising.com/v1
    description: Staging API

paths:
  /auth/login:
    post:
      summary: Initiate Stytch OAuth authentication flow
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                organization_code:
                  type: string
                  description: Organization identifier for tenant context (Stytch)
                user_type:
                  type: string
                  enum: [platform_admin, roaster, organization, customer]
                redirect_uri:
                  type: string
                  description: Post-authentication redirect URL
      responses:
        200:
          description: Authentication URL generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  auth_url:
                    type: string
                    description: Stytch OAuth authorization URL
                  state:
                    type: string
                    description: OAuth state parameter for security

  /auth/callback:
    get:
      summary: Handle Stytch OAuth callback and establish session
      parameters:
        - name: code
          in: query
          required: true
          schema:
            type: string
        - name: state
          in: query
          required: true
          schema:
            type: string
      responses:
        200:
          description: Authentication successful, session established
          content:
            application/json:
              schema:
                type: object
                properties:
                  access_token:
                    type: string
                  user:
                    $ref: '#/components/schemas/AuthenticatedUser'
                  organization:
                    $ref: '#/components/schemas/Organization'
                  features:
                    type: object
                    description: Feature flags for the user's organization

  /auth/validate:
    get:
      summary: Validate current session and return user context
      security:
        - bearerAuth: []
      responses:
        200:
          description: Session valid
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/AuthenticatedUser'
                  organization:
                    $ref: '#/components/schemas/Organization'
                  permissions:
                    type: array
                    items:
                      type: string
                  features:
                    type: object
                    description: Active feature flags

  /auth/organizations/{organization_code}/invite:
    post:
      summary: Invite user to organization with specific role
      security:
        - bearerAuth: []
      parameters:
        - name: organization_code
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                role:
                  type: string
                  enum: [admin, campaign_manager, viewer]
                permissions:
                  type: array
                  items:
                    type: string
      responses:
        201:
          description: Invitation sent successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  invitation_id:
                    type: string
                  email:
                    type: string
                  role:
                    type: string
                  status:
                    type: string
                    enum: [pending, accepted, expired]

  /organizations:
    post:
      summary: Create new organization
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrganizationCreate'
      responses:
        201:
          description: Organization created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Organization'

  /organizations/{id}/campaigns:
    post:
      summary: Create new campaign for organization
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CampaignCreate'
      responses:
        201:
          description: Campaign created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Campaign'

  /roasters/{id}/partnerships:
    get:
      summary: Get partnership requests for roaster
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Partnership requests retrieved
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/PartnershipRequest'

  /orders:
    post:
      summary: Create new order with payment processing
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderCreate'
      responses:
        201:
          description: Order created and payment processed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        user_type:
          type: string
          enum: [platform_admin, roaster, organization, customer]
        profile:
          type: object

    AuthenticatedUser:
      type: object
      properties:
        id:
          type: string
          description: Stytch user ID
        email:
          type: string
          format: email
        given_name:
          type: string
        family_name:
          type: string
        user_type:
          type: string
          enum: [platform_admin, roaster, organization, customer]
        roles:
          type: array
          items:
            type: string
        permissions:
          type: array
          items:
            type: string
        organization_code:
          type: string
          description: Current organization context
        features:
          type: object
          description: Feature flags available to user
        created_at:
          type: string
          format: date-time

    Organization:
      type: object
      properties:
        id:
          type: string
          format: uuid
        stytch_org_id:
          type: string
          description: Stytch organization ID
        name:
          type: string
        slug:
          type: string
        status:
          type: string
          enum: [active, pending, suspended, inactive]
        roaster_id:
          type: string
          format: uuid
        branding:
          type: object
        feature_flags:
          type: object
          description: Organization-specific feature flags
        created_at:
          type: string
          format: date-time

    Campaign:
      type: object
      properties:
        id:
          type: string
          format: uuid
        organization_id:
          type: string
          format: uuid
        name:
          type: string
        goal_type:
          type: string
          enum: [time_based, amount_based, ongoing]
        goal_amount:
          type: number
          format: decimal
        current_raised:
          type: number
          format: decimal
        status:
          type: string
          enum: [draft, active, paused, completed, cancelled]

    Order:
      type: object
      properties:
        id:
          type: string
          format: uuid
        campaign_id:
          type: string
          format: uuid
        customer_id:
          type: string
          format: uuid
        total_amount:
          type: number
          format: decimal
        fundraising_amount:
          type: number
          format: decimal
        status:
          type: string
          enum: [pending, paid, processing, shipped, delivered, cancelled]
        created_at:
          type: string
          format: date-time
```
