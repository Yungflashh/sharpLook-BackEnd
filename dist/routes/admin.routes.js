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
const express_1 = require("express");
const AdminController = __importStar(require("../controllers/admin.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const isAuthorized_1 = require("../middlewares/isAuthorized");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Middleware applied to all admin routes
router.use(auth_middleware_1.verifyToken, admin_middleware_1.requireAdmin);
// ========== USERS ==========
router.get("/users", (0, isAuthorized_1.isAuthorized)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), AdminController.getAllUsers);
router.get("/users/role", AdminController.getAllUsersByRole); // ?role=CLIENT
router.get("/users/new", AdminController.getNewUsersByRange); // ?range=days|weeks|months|years
router.get("/users/active", AdminController.getDailyActiveUsers);
router.get("/users/:userId", AdminController.getUserDetail);
router.put("/users/:userId/ban", AdminController.banUser);
router.put("/users/:userId/unban", AdminController.unbanUser);
router.delete("/users/:userId", AdminController.deleteUser);
router.patch("/users/:userId/promote", AdminController.promoteToAdmin); // <-- changed from /promote/:adminId to match REST pattern
// ========== PRODUCTS ==========
router.get("/products", AdminController.getAllProducts);
router.get("/products/sold", AdminController.getSoldProducts);
router.get("/products/:productId", AdminController.getProductDetail);
router.delete("/products/:productId", AdminController.deleteProduct);
router.patch("/products/:productId/approve", AdminController.approveProduct);
router.patch("/products/:productId/suspend", AdminController.suspendProduct);
router.patch("/products/:productId/reject", AdminController.rejectProduct); // reason in body
// ========== BOOKINGS ==========
router.get("/bookings", AdminController.getAllBookings);
router.get("/bookings/details", AdminController.getAllBookingsDetailed);
// ========== ORDERS ==========
router.get("/orders", AdminController.getAllOrders);
// ========== PAYMENTS ==========
router.get("/payments", AdminController.getAllPayments);
// ========== DISPUTES ==========
router.get("/disputes", AdminController.getAllDisputes);
router.patch("/disputes/:disputeId/resolve", AdminController.resolveDispute);
// ========== VENDOR ==========
router.patch("/vendors/:vendorId/verify", AdminController.verifyVendorIdentity);
// ========== PROMOTIONS ==========
router.get("/promotions", AdminController.getAllPromotions);
router.patch("/promotions/:promotionId/suspend", AdminController.suspendPromotion);
// ========== REVIEWS ==========
router.get("/reviews", AdminController.getAllReviewsWithContent);
router.delete("/reviews/:reviewId", AdminController.deleteReview);
// ========== MESSAGES ==========
router.get("/messages", AdminController.getAllMessages);
// ========== REFERRALS ==========
router.get("/referrals", AdminController.getReferralHistory);
// ========== WALLETS ==========
router.patch("/wallets/:userId/adjust", AdminController.adjustWalletBalance); // { amount } in body
// ========== STATS ==========
router.get("/stats", AdminController.getPlatformStats);
exports.default = router;
