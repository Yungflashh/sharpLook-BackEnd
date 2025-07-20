"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/admin.routes.ts
const express_1 = require("express");
const AdminController = __importStar(require("../controllers/admin.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyToken, admin_middleware_1.requireAdmin);
router.get("/users", auth_middleware_1.verifyToken, admin_middleware_1.requireAdmin, AdminController.getAllUsers);
router.get("/bookings", admin_middleware_1.requireAdmin, AdminController.getAllBookings);
router.put("/users/:userId/ban", admin_middleware_1.requireAdmin, AdminController.banUser);
router.put("/promote/:adminId", admin_middleware_1.requireAdmin, AdminController.promoteToAdmin);
router.get("/users", admin_middleware_1.requireAdmin, AdminController.getAllUsersByRole);
router.get("/users/new", admin_middleware_1.requireAdmin, AdminController.getNewUsersByRange);
router.get("/users/active", admin_middleware_1.requireAdmin, AdminController.getDailyActiveUsers);
router.get("/products", admin_middleware_1.requireAdmin, AdminController.getAllProducts);
router.get("/products/sold", admin_middleware_1.requireAdmin, AdminController.getSoldProducts);
exports.default = router;
