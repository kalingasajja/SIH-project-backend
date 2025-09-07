// roles.js or middleware.js
const ROLES = {
    FARMER: {
        name: 'farmer',
        permissions: ['create_collection', 'view_own_batches']
    },
    PROCESSOR: {
        name: 'processor',
        permissions: ['create_processing', 'view_processing_batches']
    },
    TESTER: {
        name: 'tester',
        permissions: ['create_quality_test', 'view_test_results']
    },
    MANUFACTURER: {
        name: 'manufacturer',
        permissions: ['create_formulation', 'generate_qr', 'view_manufacturing']
    },
    DISTRIBUTOR: {
        name: 'distributor',
        permissions: ['create_distribution', 'view_inventory']
    },
    RETAILER: {
        name: 'retailer',
        permissions: ['create_sale', 'view_retail_inventory']
    },
    REGULATOR: {
        name: 'regulator',
        permissions: ['view_all', 'audit_batches', 'compliance_check']
    },
    CUSTOMER: {
        name: 'customer',
        permissions: ['view_traceability', 'scan_qr']
    }
};

/**
 * Middleware factory to check if user has required role
 * @param {string|Array} allowedRoles - Single role or array of allowed roles
 */
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Ensure user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Normalize to array
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            // Check role match
            const hasRole = roles.includes(req.user.role);
            if (!hasRole) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
                });
            }

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Role verification failed',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    };
};

/**
 * Middleware to check specific permissions
 * @param {string|Array} requiredPermissions - Required permissions
 */
const permissionMiddleware = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const permissions = Array.isArray(requiredPermissions)
                ? requiredPermissions
                : [requiredPermissions];

            const userRole = Object.values(ROLES).find(r => r.name === req.user.role);

            if (!userRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid user role'
                });
            }

            const hasPermission = permissions.every(permission =>
                userRole.permissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required: ${permissions.join(', ')}`
                });
            }

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Permission verification failed',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    };
};

module.exports = {
    roleMiddleware,
    permissionMiddleware,
    ROLES
};
