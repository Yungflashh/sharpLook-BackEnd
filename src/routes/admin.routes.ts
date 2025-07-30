import { Router } from "express";
import * as AdminController from "../controllers/admin.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { Role} from '@prisma/client';
import { requireAdminRole } from "../middlewares/admin.middleware";
import { uploadSingle2 } from "../middlewares/upload.middleware";


const router = Router();

// Middleware applied to all admin routes
router.use(verifyToken);



// // SUPER ADMIN ONLY 
router.delete("/users/:userId", requireAdminRole(Role.SUPERADMIN), AdminController.deleteUser);
router.patch("/users/:userId/promote", requireAdminRole(Role.SUPERADMIN), AdminController.promoteToAdmin);
router.get("/stats", requireAdminRole(Role.SUPERADMIN), AdminController.getPlatformStats);
router.post("/createAdmin", requireAdminRole(Role.SUPERADMIN),  AdminController.createAdminUser);
router.post("/addServiceCategory", requireAdminRole(Role.SUPERADMIN), AdminController.addServiceCategory);
router.get("/getAllServiceCategory", requireAdminRole(Role.SUPERADMIN), AdminController.fetchServiceCategories);
router.delete("/deleteServiceCategory/:id", requireAdminRole(Role.SUPERADMIN), AdminController.deleteServiceCategory);
router.get("/getAllAdmins", requireAdminRole(Role.SUPERADMIN), AdminController.fetchAllAdmins);
router.delete("/deleteAdmin/:id", requireAdminRole(Role.SUPERADMIN), AdminController.deleteAdminController);
router.patch("/editAdmin/:id", requireAdminRole(Role.SUPERADMIN), AdminController.editAdminController);
router.get("/getAllBroadcast", requireAdminRole(Role.SUPERADMIN), AdminController.getAllBroadcasts);



// // ADMIN AND SUPERADMIN

// // Users
router.get("/users", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getAllUsers);
router.get("/users/role", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getAllUsersByRole);
router.get("/users/new", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getNewUsersByRange);
router.get("/users/active", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getDailyActiveUsers);
router.get("/users/:userId", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getUserDetail);
router.put("/users/:userId/ban", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.banUser);
router.put("/users/:userId/unban", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.unbanUser);
router.get("/users/notifications", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getAllNotifications);
router.get("/users/services", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getAllServices);
router.post("/broadcasts", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.createBroadcast);
router.put("/products/:productId", uploadSingle2, requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.editProductAsAdmin);

// Vendors
router.patch("/vendors/:vendorId/verify", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.verifyVendorIdentity);

// Reviews
router.get("/reviews", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getAllReviewsWithContent);
router.delete("/reviews/:reviewId", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.deleteReview);

// Messages
router.get("/messages", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getAllMessages);

// Referrals
router.get("/referrals", requireAdminRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getReferralHistory);


// // FINANCE ADMIN 

// Payments and Wallets
router.get("/payments", requireAdminRole(Role.FINANCE_ADMIN, Role.SUPERADMIN), AdminController.getAllPayments);
router.patch("/wallets/:userId/adjust", requireAdminRole(Role.FINANCE_ADMIN, Role.SUPERADMIN), AdminController.adjustWalletBalance);


// // ANALYST 

// Bookings, Orders
router.get("/bookings", requireAdminRole(Role.ANALYST, Role.SUPERADMIN), AdminController.getAllBookings);
router.get("/bookings/details", requireAdminRole(Role.ANALYST, Role.SUPERADMIN), AdminController.getAllBookingsDetailed);
router.get("/orders", requireAdminRole(Role.ANALYST, Role.SUPERADMIN), AdminController.getAllOrders);



// // CONTENT MANAGER

// // Product moderation
router.get("/products", requireAdminRole(Role.CONTENT_MANAGER, Role.SUPERADMIN), AdminController.getAllProducts);
router.get("/products/sold", requireAdminRole(Role.CONTENT_MANAGER, Role.SUPERADMIN), AdminController.getSoldProducts);
router.get("/products/:productId", requireAdminRole(Role.CONTENT_MANAGER, Role.SUPERADMIN), AdminController.getProductDetail);
router.delete("/products/:productId", requireAdminRole(Role.CONTENT_MANAGER, Role.SUPERADMIN), AdminController.deleteProduct);
router.patch("/products/:productId/approve", requireAdminRole(Role.CONTENT_MANAGER, Role.SUPERADMIN), AdminController.approveProduct);
router.patch("/products/:productId/suspend", requireAdminRole(Role.CONTENT_MANAGER, Role.SUPERADMIN), AdminController.suspendProduct);
router.patch("/products/:productId/reject", requireAdminRole(Role.CONTENT_MANAGER, Role.SUPERADMIN), AdminController.rejectProduct);

// Promotions
router.get("/promotions", requireAdminRole(Role.CONTENT_MANAGER, Role.SUPERADMIN), AdminController.getAllPromotions);
router.patch("/promotions/:promotionId/suspend", requireAdminRole(Role.CONTENT_MANAGER, Role.SUPERADMIN), AdminController.suspendPromotion);



// // SUPPORT ADMIN

// Dispute resolution
router.get("/disputes", requireAdminRole(Role.SUPPORT, Role.SUPERADMIN), AdminController.getAllDisputes);
router.patch("/disputes/:disputeId/resolve", requireAdminRole(Role.SUPPORT, Role.SUPERADMIN), AdminController.resolveDispute);
export default router;