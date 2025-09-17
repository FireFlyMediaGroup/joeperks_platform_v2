# Sprint Change Proposal — Auth Provider Alignment (Kinde → Stytch)

- Date: 2025-09-16
- Owner: Platform
- Status: Proposed (Docs updated)

## Summary
Align all documentation and the Security Event Auditing story with our current authentication provider decision: migrate references from Kinde to Stytch, and ensure Medusa v2 integration patterns are reflected. No code changes included in this proposal; only documentation/story alignment for development readiness.

## Motivation
- Reduce confusion from mixed references (Kinde vs Stytch)
- Ensure stories/specs match our current stack and conventions
- Prepare for production hardening (audit logging story updated with performance and feature-flag requirements)

## Scope of Changes (Docs Only)
- Story alignment
  - docs/stories/0.1.security-event-auditing-service.md — Updated integration points (Medusa v2 middlewares + Stytch), acceptance criteria (≤ 5ms p95 overhead, feature flag, retention), endpoint naming, and performance notes
- Architecture
  - docs/architecture/api-specification.md — OAuth flow summaries, user ID description, organization schema (kinde_org_code → stytch_org_id)
  - docs/architecture/database-schema.md — Renamed kinde_* columns and indexes to stytch_* in documentation; added comments to reflect Stytch
  - docs/architecture/core-workflows.md — Mermaid participants/steps now reference Stytch
  - docs/architecture/deployment-strategy.md — Security monitoring note updated to Stytch
  - docs/architecture/source-tree.md — Auth components/hooks/types/client names updated to Stytch in the illustrative tree
  - docs/architecture/tech-stack 2.md — Backend and React SDK references updated to Stytch
- Epics & Stories
  - docs/epics/medusa-v2-setup.md — Scope, risks, auth integration phase, tests, and AC updated to Stytch
  - docs/epics/shared-services/01-authentication-authorization.md — Acceptance, dependencies, technical considerations, DoD updated to Stytch
  - docs/epics/shared-services/README.md — Summary and integrations list updated
  - docs/epics/organization-portal/01-onboarding-setup.md — Auth provider updated
  - docs/stories/2.1.organization-management-service.md — AC, tasks, data model snippet, integrations, testing updated to Stytch
  - docs/stories/2.3.organization-member-management-ui.md — Frontend SDK and hooks updated to Stytch

## Out of Scope (Future Work)
- Actual code migrations/renames for any kinde_* fields or files in the application codebase
- Database migrations reflecting stytch_* columns (the schema doc is authoritative for target state but no migration created here)
- End-to-end auth flow updates (already decided; tracked elsewhere)

## Compatibility & Risks
- Documentation-only change; no runtime impact
- If developers follow docs literally, ensure corresponding code changes/migrations are planned before implementation (e.g., stytch_org_id vs kinde_org_code)

## Verification
- Grep scan across docs shows no remaining active “Kinde” usage except historical notes in setup/integration plan that explicitly describe the replacement:
  - docs/setup/current-status.md (status line noting Kinde→Stytch complete)
  - docs/marketplace_integration_plan.md (instructions to replace Kinde usages)

## Rollback
- Revert documentation changes (git revert) if needed

## Next Steps
1) Confirm this change proposal
2) Plan code-level follow-ups (separate tickets):
   - Update database migrations for stytch_* columns (if not yet implemented)
   - Update types/interfaces and any remaining code references
   - Validate Stytch OAuth endpoints and org identifier semantics across services
3) Implement Security Event Auditing service per Story 0.1 with feature flag and performance guardrails

