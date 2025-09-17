# Joe Perks Platform - Admin Interfaces Guide-Medusa Admin vs. Platform Admin roles

## Overview

The Joe Perks platform uses **two distinct admin interfaces** that serve different purposes and user types. Understanding when and how to use each interface is crucial for effective platform management.

## 🏛️ Medusa Admin Panel (Technical Operations)

### **Access Information**
- **URL**: http://localhost:9000/app
- **Credentials**: `admin@joeperks.com` / `admin123`
- **Technology**: Built-in Medusa.js admin interface
- **Port**: 9000 (same as API server)

### **Primary Users**
- **System Administrators**: Technical staff managing platform infrastructure
- **DevOps Engineers**: Deployment, monitoring, and system maintenance
- **Technical Support**: Staff handling technical troubleshooting
- **Database Administrators**: Data management and integrity

### **Core Purpose**
**Technical e-commerce infrastructure management and system operations**

### **Key Capabilities**

#### E-commerce Core Management
- Product catalog structure and management
- Order processing and fulfillment tracking
- Customer account management at database level
- Inventory management and stock tracking
- Pricing and discount configuration

#### System Configuration
- Currency and region setup
- Tax configuration and rules
- Shipping zones and methods
- Payment gateway configuration (Stripe Connect)
- API key management and integrations

#### Technical Operations
- Database-level data access and modification
- Transaction monitoring and troubleshooting
- Payment processing issue resolution
- System health monitoring
- Error investigation and debugging

#### User Account Management
- Create and manage admin users
- Configure user roles and permissions
- API access token management
- Security settings and authentication

### **When to Use Medusa Admin**

#### Daily Operations
- ✅ Investigating payment failures or processing issues
- ✅ Troubleshooting order fulfillment problems
- ✅ Managing system-wide e-commerce settings
- ✅ Creating new admin users or API keys
- ✅ Monitoring transaction volumes and system health

#### Setup & Configuration
- ✅ Initial platform setup (currencies, regions, tax zones)
- ✅ Configuring Stripe Connect and payment settings
- ✅ Setting up shipping zones and fulfillment providers
- ✅ Managing platform-wide promotions or fee structures

#### Technical Troubleshooting
- ✅ Accessing detailed transaction logs and audit trails
- ✅ Debugging data integrity issues
- ✅ Investigating API errors or system failures
- ✅ Managing database migrations and updates

---

## 🎛️ Platform Admin Dashboard (Business Operations)

### **Access Information**
- **URL**: http://localhost:4000 (when built)
- **Authentication**: Stytch SSO integration
- **Technology**: Custom Next.js application
- **Status**: 🚧 Currently in development (placeholder app)

### **Primary Users**
- **Platform Administrators**: Senior staff with full business oversight
- **Customer Support Representatives**: User support and dispute resolution
- **Business Analysts**: Performance monitoring and reporting
- **Operations Managers**: Day-to-day platform operations

### **Core Purpose**
**Business operations, user management, and strategic platform oversight**

### **Key Capabilities** (Planned)

#### User Management & Approvals
- Organization application review and approval
- Roaster application review and approval
- User verification and background checks
- User lifecycle management (active, suspended, terminated)
- Bulk user operations and communications

#### Business Analytics & Reporting
- Platform-wide performance metrics
- Revenue analytics and financial reporting
- Campaign success tracking and insights
- User growth and engagement metrics
- Market analysis and business intelligence

#### Campaign & Partnership Management
- Monitor all fundraising campaigns across organizations
- Oversee roaster-organization partnerships
- Campaign performance optimization
- Partnership dispute resolution
- Success story tracking and promotion

#### Customer Support & Communication
- Support ticket management system
- User communication tools (email, in-app messaging)
- Knowledge base and FAQ management
- Community forum moderation
- Announcement and notification system

#### Platform Configuration & Features
- Feature flag management and A/B testing
- Platform settings and business rules
- User role and permission management
- Integration settings and third-party tools
- Compliance monitoring and reporting

### **When to Use Platform Admin Dashboard**

#### Daily Business Operations
- ✅ Reviewing and approving new organization/roaster applications
- ✅ Handling customer support tickets and user communications
- ✅ Monitoring campaign performance and success metrics
- ✅ Resolving disputes between organizations and roasters
- ✅ Managing platform announcements and communications

#### Strategic Management
- ✅ Analyzing business performance and growth metrics
- ✅ Making decisions on platform features and policies
- ✅ Managing user acquisition and retention strategies
- ✅ Overseeing compliance and regulatory requirements
- ✅ Planning platform expansion and market development

#### User Relationship Management
- ✅ Onboarding new organizations and roasters
- ✅ Providing user training and support
- ✅ Managing user feedback and feature requests
- ✅ Building community engagement and relationships
- ✅ Handling escalated support issues

---

## 🔄 How They Work Together

### **Complementary Workflow Examples**

#### New Roaster Onboarding
1. **Platform Admin Dashboard**: 
   - Review roaster application and business documents
   - Approve/reject application with feedback
   - Communicate with roaster throughout process
   
2. **Medusa Admin**: 
   - Create roaster's technical account and user access
   - Set up Stripe Connect account and payment settings
   - Configure product catalog structure and shipping profiles

#### Payment Issue Resolution
1. **Platform Admin Dashboard**: 
   - Receive customer support ticket about payment failure
   - Communicate with affected customer and organization
   - Track issue resolution and customer satisfaction
   
2. **Medusa Admin**: 
   - Investigate technical payment failure in transaction logs
   - Check Stripe webhook logs and API responses
   - Process refunds or retry failed payments

#### Campaign Performance Analysis
1. **Platform Admin Dashboard**: 
   - View high-level campaign metrics and success rates
   - Generate business reports for stakeholders
   - Identify trends and optimization opportunities
   
2. **Medusa Admin**: 
   - Access detailed transaction data and order history
   - Export raw data for advanced analytics
   - Verify data integrity and calculation accuracy

### **Data Flow Between Interfaces**
- **Platform Admin Dashboard** → **Custom API Endpoints** → **Medusa Backend**
- **Medusa Admin** → **Direct Database Access** → **Medusa Core Tables**
- Both interfaces share the same underlying data but present it differently

---

## 🎯 Quick Reference Guide

### **Use Medusa Admin When:**
- 🔧 Technical issues need investigation
- ⚙️ System configuration changes required
- 💳 Payment processing problems occur
- 🗄️ Database-level operations needed
- 🔑 Admin users or API keys need management

### **Use Platform Admin Dashboard When:**
- 👥 User applications need review
- 📊 Business metrics need analysis
- 🎯 Campaigns need monitoring
- 🛠️ Support tickets need handling
- 📈 Strategic decisions need data

### **Current Status**
- ✅ **Medusa Admin**: Fully operational and ready for use
- 🚧 **Platform Admin Dashboard**: In development, placeholder app currently

---

## 🔐 Security & Access Control

### **Medusa Admin Security**
- Direct database access requires careful handling
- Admin users should be limited to technical staff only
- All actions are logged for audit purposes
- Regular credential rotation recommended

### **Platform Admin Dashboard Security** (Planned)
- Stytch SSO integration for secure authentication
- Role-based access control for different user types
- Audit logging for all business operations
- Data privacy compliance built-in

---

## 📚 Additional Resources

- **Medusa Admin Documentation**: [Medusa.js Admin Guide](https://docs.medusajs.com/admin)
- **Platform Admin Epics**: `docs/epics/platform-admin/README.md`
- **Architecture Overview**: `docs/architecture/high-level-architecture.md`
- **Greenfield Build Guide**: `docs/greenfield/README.md`

---

*This document will be updated as the Platform Admin Dashboard is developed and new features are added to both interfaces.*
