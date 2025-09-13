# Joe Perks Platform - Security Configuration Guide

## Overview

This document outlines the security configuration and best practices for the Joe Perks multi-tenant SaaS platform. The platform handles sensitive financial data, personal information, and multi-tenant isolation requirements.

## Environment Structure

### Directory Layout
```
config/
├── environments/           # Environment templates (safe to commit)
│   ├── .env.local.example
│   ├── .env.staging.example
│   └── .env.production.example
├── secrets/               # Actual secrets (NEVER commit)
│   ├── development/
│   │   └── .env.local
│   ├── staging/
│   │   └── .env.staging
│   └── production/
│       └── .env.production
└── keys/                  # Encryption keys (NEVER commit)
    ├── jwt/
    └── encryption/
```

## Secret Generation

### Automated Secret Generation
Use the provided script to generate cryptographically secure secrets:

```bash
# Generate secrets for development
./scripts/generate-secrets.sh development

# Generate secrets for staging
./scripts/generate-secrets.sh staging

# Generate secrets for production
./scripts/generate-secrets.sh production
```

### Manual Secret Generation
If you need to generate secrets manually:

```bash
# Generate a 256-bit secret (32 bytes, base64 encoded)
openssl rand -base64 32

# Generate a 512-bit secret (64 bytes, base64 encoded)
openssl rand -base64 64

# Generate a UUID
uuidgen | tr '[:upper:]' '[:lower:]'
```

## Environment-Specific Security

### Development Environment
- Use test/sandbox accounts for all external services
- Enable debug logging for troubleshooting
- Use `lvh.me` for local subdomain testing
- Separate database from staging/production

### Staging Environment
- Mirror production security settings
- Use test mode for payment processing
- Separate service accounts from production
- Enable monitoring and alerting
- Regular security testing and penetration testing

### Production Environment
- **CRITICAL**: Use unique, strong secrets (minimum 256-bit)
- Enable all security features (rate limiting, CORS, etc.)
- Use live payment processing with proper fraud detection
- Implement comprehensive monitoring and alerting
- Regular security audits and compliance checks
- Automated backup and disaster recovery

## Multi-Tenant Security

### Data Isolation
- **Database Level**: Tenant ID in all queries with row-level security
- **API Level**: Middleware validates tenant context from JWT tokens
- **File Storage**: Tenant-specific directories and access controls
- **Cache**: Tenant-prefixed keys to prevent data leakage

### Authentication & Authorization
- **Stytch Integration**: OAuth 2.0 with organization-based multi-tenancy
- **JWT Tokens**: Include tenant context and role-based permissions
- **Session Management**: Secure session handling with Redis storage
- **Cross-App SSO**: Maintain authentication across all platform applications

### Role-Based Access Control (RBAC)
```
Platform Admin    → Full system access
Organization Admin → Full org access, can invite members
Campaign Manager  → Create/edit campaigns, view analytics
Organization Viewer → Read-only org access
Roaster Admin     → Full roaster portal access
Roaster Staff     → Order fulfillment only
Customer          → Purchase access, order history
```

## Service Account Security

### Stripe Connect
- Use separate Stripe accounts for each environment
- Enable Stripe Radar for fraud detection in production
- Implement webhook signature validation
- Monitor for suspicious transaction patterns

### Stytch Authentication
- Separate Stytch projects for each environment
- Configure proper redirect URLs for each environment
- Enable MFA for admin accounts
- Monitor authentication logs for suspicious activity

### Supabase Database
- Use separate Supabase projects for each environment
- Enable Row Level Security (RLS) policies
- Use service role keys only for server-side operations
- Regular database backups and point-in-time recovery

### Redis Cache
- Use separate Redis instances for each environment
- Enable Redis AUTH with strong passwords
- Configure proper network security (VPC/firewall)
- Monitor for unusual access patterns

## Security Checklist

### Before Deployment
- [ ] All secrets are environment-specific and unique
- [ ] No secrets committed to version control
- [ ] All external services use separate accounts per environment
- [ ] Database RLS policies are properly configured
- [ ] API endpoints have proper authentication middleware
- [ ] Rate limiting is enabled and configured
- [ ] CORS is properly configured for each environment
- [ ] SSL/TLS certificates are valid and properly configured

### Production Specific
- [ ] All secrets are 256-bit minimum strength
- [ ] Payment processing is in live mode with fraud detection
- [ ] Monitoring and alerting are configured
- [ ] Backup and disaster recovery procedures are tested
- [ ] Security headers are enabled (Helmet.js)
- [ ] Regular security scans are scheduled
- [ ] Incident response procedures are documented

## Incident Response

### Security Incident Procedure
1. **Immediate Response**
   - Isolate affected systems
   - Preserve evidence and logs
   - Notify security team and stakeholders

2. **Assessment**
   - Determine scope and impact
   - Identify compromised data or systems
   - Document timeline of events

3. **Containment**
   - Stop ongoing attack or breach
   - Patch vulnerabilities
   - Rotate compromised credentials

4. **Recovery**
   - Restore systems from clean backups
   - Verify system integrity
   - Monitor for continued threats

5. **Post-Incident**
   - Conduct post-mortem analysis
   - Update security procedures
   - Notify affected users if required

## Compliance Considerations

### PCI DSS
- Stripe handles payment card data (PCI DSS compliant)
- Platform maintains PCI DSS compliance for stored cardholder data
- Regular security assessments and vulnerability scans

### Data Privacy
- GDPR compliance for EU users
- CCPA compliance for California users
- Data retention and deletion policies
- User consent and data portability

### Financial Regulations
- Anti-money laundering (AML) compliance
- Know Your Customer (KYC) requirements
- Financial reporting and audit trails

## Monitoring and Alerting

### Security Monitoring
- Failed authentication attempts
- Unusual API access patterns
- Database query anomalies
- File access violations
- Payment processing irregularities

### Automated Alerts
- Multiple failed login attempts
- Unusual transaction volumes
- System performance degradation
- Security scan findings
- Certificate expiration warnings

## Regular Security Tasks

### Daily
- Monitor security alerts and logs
- Review failed authentication attempts
- Check system health and performance

### Weekly
- Review access logs and user activity
- Update security patches and dependencies
- Verify backup integrity

### Monthly
- Rotate non-critical API keys
- Review user access and permissions
- Security scan and vulnerability assessment

### Quarterly
- Rotate critical secrets (JWT, session keys)
- Comprehensive security audit
- Penetration testing
- Disaster recovery testing

## Contact Information

### Security Team
- **Security Lead**: [security@joeperks.com]
- **Incident Response**: [incident@joeperks.com]
- **Emergency Contact**: [emergency@joeperks.com]

### External Security Services
- **Penetration Testing**: [TBD]
- **Security Auditing**: [TBD]
- **Compliance Consulting**: [TBD]

---

**Remember**: Security is everyone's responsibility. When in doubt, err on the side of caution and consult the security team.
