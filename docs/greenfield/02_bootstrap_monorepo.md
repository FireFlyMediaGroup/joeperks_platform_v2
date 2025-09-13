# 02 — Bootstrap Nx Monorepo (pnpm)

From an empty folder (choose your root folder name, e.g., joeperks):

```bash
# Create empty Nx workspace (no preset)
pnpm dlx create-nx-workspace@latest joeperks --preset=empty --pm=pnpm
cd joeperks

# Initialize Git
git init && git add . && git commit -m "chore: nx workspace"
```

Install core Nx plugins:
```bash
pnpm add -D @nx/next @nx/node @nx/react @nx/jest @nx/vite @nx/eslint @nx/web typescript ts-node
pnpm add -D eslint prettier @types/node
```

Create apps (best-practice names):
```bash
# Customer storefront (Next.js App Router)
pnpm nx g @nx/next:app storefront-customer --style=css --directory=apps --e2eTestRunner=none --bundler=swc --no-interactive

# Platform admin (Next.js)
pnpm nx g @nx/next:app admin-platform --style=css --directory=apps --e2eTestRunner=none --bundler=swc --no-interactive

# Organization dashboard (Next.js)
pnpm nx g @nx/next:app dashboard-organization --style=css --directory=apps --e2eTestRunner=none --bundler=swc --no-interactive

# Roaster portal (Next.js)
pnpm nx g @nx/next:app portal-roaster --style=css --directory=apps --e2eTestRunner=none --bundler=swc --no-interactive
```

Create shared libraries:
```bash
pnpm nx g @nx/js:lib shared-ui --directory=libs --bundler=vite --no-interactive
pnpm nx g @nx/js:lib shared-types --directory=libs --bundler=vite --no-interactive
pnpm nx g @nx/js:lib shared-utils --directory=libs --bundler=vite --no-interactive
```

Commit:
```bash
git add . && git commit -m "feat: scaffold next apps and shared libs"
```

Notes:
- We’ll add the Medusa backend in step 03.
- Adjust ESLint and tsconfig base as needed after scaffolding.

