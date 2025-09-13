# 14 — Acceptance Checklists (Smoke Scripts)

## Marketplace ops
- [ ] Create super admin (plugin)
- [ ] Create roaster vendor store
- [ ] Impersonate vendor (if using Admin UI) or login to roaster portal

## Campaigns and orgs
- [ ] Create organization
- [ ] Create campaign and set goal
- [ ] Set storefront branding

## Catalog and orders
- [ ] Roaster adds products and inventory
- [ ] Customer browses org storefront and purchases
- [ ] Order routes to correct roaster

## Payments
- [ ] Stripe Connect onboarding for roaster
- [ ] Payment succeeds and transfers created
- [ ] Audit trail shows transfer IDs

## Auth & tenancy
- [ ] Stytch login for each app by role
- [ ] Cross-tenant data access blocked

## Notifications
- [ ] SendGrid emails on order events (mock in staging)
- [ ] Twilio SMS on shipment/delivery

## Observability
- [ ] Error logs and performance metrics visible

## Deployment
- [ ] Vercel apps healthy
- [ ] Railway backend healthy
- [ ] Webhooks received

