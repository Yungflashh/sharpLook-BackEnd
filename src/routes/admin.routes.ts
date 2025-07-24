import { Router } from "express";
import * as AdminController from "../controllers/admin.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { isAuthorized } from "../middlewares/isAuthorized";
import { Role } from '@prisma/client';

const router = Router();

// Middleware applied to all admin routes
router.use(verifyToken, requireAdmin);

// ========== USERS ==========
router.get("/users", isAuthorized(Role.ADMIN, Role.SUPERADMIN), AdminController.getAllUsers);
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

export default router;
