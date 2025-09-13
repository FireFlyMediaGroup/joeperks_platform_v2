# 🔐 Admin Access - Quick Reference

## Default Admin Credentials

**Email**: `admin@joeperks.com`  
**Password**: `admin123`

## Access URLs

**Admin Panel**: http://localhost:9000/admin  
**API Base**: http://localhost:9000

## Quick Start

1. **Start the server**:
   ```bash
   pnpm nx serve medusa-server
   ```

2. **Open admin panel**: http://localhost:9000/admin

3. **Login** with credentials above

## Additional Information

- **Full credentials file**: `config/secrets/development/admin-credentials.md`
- **Environment file**: `apps/medusa-server/.env` (see comments at bottom)
- **Create new admin**: `pnpm exec medusa user --email new@example.com --password newpass`

---
⚠️ **Development credentials only** - Change for production use
