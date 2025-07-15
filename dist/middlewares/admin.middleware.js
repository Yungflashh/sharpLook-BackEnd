"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    next();
};
exports.requireAdmin = requireAdmin;
