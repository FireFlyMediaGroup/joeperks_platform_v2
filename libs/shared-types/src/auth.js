"use strict";
/**
 * Authentication and Authorization Types
 *
 * Defines the role-based access control (RBAC) system for the Joe Perks platform.
 * These types are shared across all applications and services.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.Permission = exports.UserRole = void 0;
exports.hasRole = hasRole;
exports.hasPermission = hasPermission;
exports.getUserPermissions = getUserPermissions;
exports.canAccessOrganization = canAccessOrganization;
exports.canAccessRoaster = canAccessRoaster;
/**
 * User roles in the Joe Perks platform
 * Maps to Stytch roles and permissions
 */
var UserRole;
(function (UserRole) {
    // Platform Administration
    UserRole["PLATFORM_ADMIN"] = "platform_admin";
    // Organization Roles
    UserRole["ORGANIZATION_ADMIN"] = "organization_admin";
    UserRole["CAMPAIGN_MANAGER"] = "campaign_manager";
    UserRole["ORGANIZATION_VIEWER"] = "organization_viewer";
    // Roaster Roles
    UserRole["ROASTER_ADMIN"] = "roaster_admin";
    UserRole["ROASTER_STAFF"] = "roaster_staff";
    // Customer Role
    UserRole["CUSTOMER"] = "customer";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Permissions for different actions in the platform
 */
var Permission;
(function (Permission) {
    // Platform Management
    Permission["MANAGE_PLATFORM"] = "manage_platform";
    Permission["VIEW_PLATFORM_ANALYTICS"] = "view_platform_analytics";
    Permission["MANAGE_USERS"] = "manage_users";
    // Organization Management
    Permission["MANAGE_ORGANIZATION"] = "manage_organization";
    Permission["CREATE_CAMPAIGNS"] = "create_campaigns";
    Permission["MANAGE_CAMPAIGNS"] = "manage_campaigns";
    Permission["VIEW_ORGANIZATION_ANALYTICS"] = "view_organization_analytics";
    Permission["INVITE_ORGANIZATION_MEMBERS"] = "invite_organization_members";
    // Roaster Management
    Permission["MANAGE_ROASTER"] = "manage_roaster";
    Permission["MANAGE_PRODUCTS"] = "manage_products";
    Permission["FULFILL_ORDERS"] = "fulfill_orders";
    Permission["VIEW_ROASTER_ANALYTICS"] = "view_roaster_analytics";
    Permission["MANAGE_PARTNERSHIPS"] = "manage_partnerships";
    // Customer Actions
    Permission["PLACE_ORDERS"] = "place_orders";
    Permission["VIEW_ORDER_HISTORY"] = "view_order_history";
    Permission["MANAGE_PROFILE"] = "manage_profile";
})(Permission || (exports.Permission = Permission = {}));
/**
 * Role to permissions mapping
 */
exports.ROLE_PERMISSIONS = {
    [UserRole.PLATFORM_ADMIN]: [
        Permission.MANAGE_PLATFORM,
        Permission.VIEW_PLATFORM_ANALYTICS,
        Permission.MANAGE_USERS,
        Permission.MANAGE_ORGANIZATION,
        Permission.CREATE_CAMPAIGNS,
        Permission.MANAGE_CAMPAIGNS,
        Permission.VIEW_ORGANIZATION_ANALYTICS,
        Permission.INVITE_ORGANIZATION_MEMBERS,
        Permission.MANAGE_ROASTER,
        Permission.MANAGE_PRODUCTS,
        Permission.FULFILL_ORDERS,
        Permission.VIEW_ROASTER_ANALYTICS,
        Permission.MANAGE_PARTNERSHIPS,
        Permission.PLACE_ORDERS,
        Permission.VIEW_ORDER_HISTORY,
        Permission.MANAGE_PROFILE,
    ],
    [UserRole.ORGANIZATION_ADMIN]: [
        Permission.MANAGE_ORGANIZATION,
        Permission.CREATE_CAMPAIGNS,
        Permission.MANAGE_CAMPAIGNS,
        Permission.VIEW_ORGANIZATION_ANALYTICS,
        Permission.INVITE_ORGANIZATION_MEMBERS,
        Permission.PLACE_ORDERS,
        Permission.VIEW_ORDER_HISTORY,
        Permission.MANAGE_PROFILE,
    ],
    [UserRole.CAMPAIGN_MANAGER]: [
        Permission.CREATE_CAMPAIGNS,
        Permission.MANAGE_CAMPAIGNS,
        Permission.VIEW_ORGANIZATION_ANALYTICS,
        Permission.PLACE_ORDERS,
        Permission.VIEW_ORDER_HISTORY,
        Permission.MANAGE_PROFILE,
    ],
    [UserRole.ORGANIZATION_VIEWER]: [
        Permission.VIEW_ORGANIZATION_ANALYTICS,
        Permission.PLACE_ORDERS,
        Permission.VIEW_ORDER_HISTORY,
        Permission.MANAGE_PROFILE,
    ],
    [UserRole.ROASTER_ADMIN]: [
        Permission.MANAGE_ROASTER,
        Permission.MANAGE_PRODUCTS,
        Permission.FULFILL_ORDERS,
        Permission.VIEW_ROASTER_ANALYTICS,
        Permission.MANAGE_PARTNERSHIPS,
        Permission.PLACE_ORDERS,
        Permission.VIEW_ORDER_HISTORY,
        Permission.MANAGE_PROFILE,
    ],
    [UserRole.ROASTER_STAFF]: [
        Permission.FULFILL_ORDERS,
        Permission.VIEW_ROASTER_ANALYTICS,
        Permission.PLACE_ORDERS,
        Permission.VIEW_ORDER_HISTORY,
        Permission.MANAGE_PROFILE,
    ],
    [UserRole.CUSTOMER]: [
        Permission.PLACE_ORDERS,
        Permission.VIEW_ORDER_HISTORY,
        Permission.MANAGE_PROFILE,
    ],
};
/**
 * Type guard to check if user has specific role
 */
function hasRole(user, role) {
    return user.roles.includes(role);
}
/**
 * Type guard to check if user has specific permission
 */
function hasPermission(user, permission) {
    return user.roles.some(role => exports.ROLE_PERMISSIONS[role].includes(permission));
}
/**
 * Get all permissions for a user based on their roles
 */
function getUserPermissions(user) {
    const permissions = new Set();
    user.roles.forEach(role => {
        exports.ROLE_PERMISSIONS[role].forEach(permission => {
            permissions.add(permission);
        });
    });
    return Array.from(permissions);
}
/**
 * Check if user can access a specific organization
 */
function canAccessOrganization(user, organizationId) {
    // Platform admins can access any organization
    if (hasRole(user, UserRole.PLATFORM_ADMIN)) {
        return true;
    }
    // Users can only access their own organization
    return user.organizationId === organizationId;
}
/**
 * Check if user can access a specific roaster
 */
function canAccessRoaster(user, roasterId) {
    // Platform admins can access any roaster
    if (hasRole(user, UserRole.PLATFORM_ADMIN)) {
        return true;
    }
    // Users can only access their own roaster
    return user.roasterId === roasterId;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImF1dGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOzs7QUFvTUgsMEJBRUM7QUFLRCxzQ0FFQztBQUtELGdEQVVDO0FBS0Qsc0RBUUM7QUFLRCw0Q0FRQztBQXBQRDs7O0dBR0c7QUFDSCxJQUFZLFFBZVg7QUFmRCxXQUFZLFFBQVE7SUFDbEIsMEJBQTBCO0lBQzFCLDZDQUFpQyxDQUFBO0lBRWpDLHFCQUFxQjtJQUNyQixxREFBeUMsQ0FBQTtJQUN6QyxpREFBcUMsQ0FBQTtJQUNyQyx1REFBMkMsQ0FBQTtJQUUzQyxnQkFBZ0I7SUFDaEIsMkNBQStCLENBQUE7SUFDL0IsMkNBQStCLENBQUE7SUFFL0IsZ0JBQWdCO0lBQ2hCLGlDQUFxQixDQUFBO0FBQ3ZCLENBQUMsRUFmVyxRQUFRLHdCQUFSLFFBQVEsUUFlbkI7QUFFRDs7R0FFRztBQUNILElBQVksVUF3Qlg7QUF4QkQsV0FBWSxVQUFVO0lBQ3BCLHNCQUFzQjtJQUN0QixpREFBbUMsQ0FBQTtJQUNuQyxpRUFBbUQsQ0FBQTtJQUNuRCwyQ0FBNkIsQ0FBQTtJQUU3QiwwQkFBMEI7SUFDMUIseURBQTJDLENBQUE7SUFDM0MsbURBQXFDLENBQUE7SUFDckMsbURBQXFDLENBQUE7SUFDckMseUVBQTJELENBQUE7SUFDM0QseUVBQTJELENBQUE7SUFFM0QscUJBQXFCO0lBQ3JCLCtDQUFpQyxDQUFBO0lBQ2pDLGlEQUFtQyxDQUFBO0lBQ25DLCtDQUFpQyxDQUFBO0lBQ2pDLCtEQUFpRCxDQUFBO0lBQ2pELHlEQUEyQyxDQUFBO0lBRTNDLG1CQUFtQjtJQUNuQiwyQ0FBNkIsQ0FBQTtJQUM3Qix1REFBeUMsQ0FBQTtJQUN6QywrQ0FBaUMsQ0FBQTtBQUNuQyxDQUFDLEVBeEJXLFVBQVUsMEJBQVYsVUFBVSxRQXdCckI7QUFFRDs7R0FFRztBQUNVLFFBQUEsZ0JBQWdCLEdBQW1DO0lBQzlELENBQUMsUUFBUSxDQUFD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