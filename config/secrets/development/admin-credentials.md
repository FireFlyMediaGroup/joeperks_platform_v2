# Admin Credentials - Development Environment

> **📖 Important**: This is the **Medusa Admin Panel** for technical operations. For information about the different admin interfaces and their purposes, see: `docs/admin-interfaces-guide.md`

## 🔐 Default Admin User

**Email**: `admin@joeperks.com`  
**Password**: `admin123`

## 🌐 Access URLs

**Medusa Admin Panel**: http://localhost:9000/app
**API Base URL**: http://localhost:9000

## 📋 Usage Instructions

### Login to Admin Panel
1. Start the Medusa server: `pnpm nx serve medusa-server`
2. Open browser to: http://localhost:9000/app
3. Login with the credentials above

### API Authentication
Use these credentials for API testing with tools like Postman or curl:

```bash
# Login via API
curl -X POST http://localhost:9000/admin/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@joeperks.com",
    "password": "admin123"
  }'
```

## 🔄 Creating Additional Admin Users

```bash
# From apps/medusa-server directory
pnpm exec medusa user --email newadmin@joeperks.com --password secure-password

# Or via Nx workspace
pnpm nx user:create medusa-server
```

## ⚠️ Security Notes

- **Development Only**: These are development credentials
- **Change for Production**: Use secure passwords for staging/production
- **Rotate Regularly**: Change passwords periodically
- **Limit Access**: Only share with authorized team members

---
**Created**: Step 04 Database Setup  
**Environment**: Development  
**Last Updated**: January 13, 2025
