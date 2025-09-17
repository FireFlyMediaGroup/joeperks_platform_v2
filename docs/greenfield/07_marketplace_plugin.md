# 07 — Marketplace Plugin (Archived)

This step has been archived. We previously considered `@techlabi/medusa-marketplace-plugin`, but it is incompatible with Medusa v2 due to workflow conflicts.

Use the native recipe instead:
- New step: 07 — Marketplace (Medusa v2 Native Recipe)
- File: `07_marketplace_native.md`
- Official recipe: https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors

If the plugin is already installed, remove it and clean up config:
```bash
pnpm remove @techlabi/medusa-marketplace-plugin
```

For details, see:
- docs/marketplace-integration-status.md (investigation + resolution)
- docs/architecture/components.md → Marketplace Module (Vendor Management)
- docs/greenfield/07_marketplace_native.md (current implementation)
