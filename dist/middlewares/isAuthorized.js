"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminRole = exports.isAuthorized = void 0;
const isAuthorized = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ message: "Forbidden: Unauthorized access" });
        }
        next();
    };
};
exports.isAuthorized = isAuthorized;
const requireAdminRole = (adminRoles = []) => {
    return (req, res, next) => {
        const user = req.user;
        if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: 'Admins only' });
        }
        if (adminRoles.length && !adminRoles.includes(user.adminRole)) {
            return res.status(403).json({ message: 'Forbidden: Not enough admin privileges' });
        }
        next();
    };
};
exports.requireAdminRole = requireAdminRole;
