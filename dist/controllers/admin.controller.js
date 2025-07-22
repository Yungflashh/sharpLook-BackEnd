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
exports.getAllBookingsDetailed = exports.getAllBookings = exports.getAllPayments = exports.getAllOrders = exports.resolveDispute = exports.getAllDisputes = exports.rejectProduct = exports.suspendProduct = exports.approveProduct = exports.deleteProduct = exports.getProductDetail = exports.getSoldProducts = exports.getAllProducts = exports.getDailyActiveUsers = exports.getNewUsersByRange = exports.getAllUsersByRole = exports.promoteToAdmin = exports.unbanUser = exports.banUser = exports.deleteUser = exports.getUserDetail = exports.getAllUsers = void 0;
const AdminService = __importStar(require("../services/admin.service"));
const email_helper_1 = require("../helpers/email.helper");
// Utility to extract error message safely
const getErrorMessage = (error) => error instanceof Error ? error.message : "Internal server error";
// ====================== USERS ======================
const getAllUsers = async (_req, res) => {
    try {
        const users = await AdminService.getAllUsers();
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getAllUsers = getAllUsers;
const getUserDetail = async (req, res) => {
    try {
        const user = await AdminService.getUserDetail(req.params.userId);
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getUserDetail = getUserDetail;
const deleteUser = async (req, res) => {
    try {
        const user = await AdminService.deleteUser(req.params.userId);
        await (0, email_helper_1.sendMail)(user.email, "Account Deleted", `<p>Your account has been permanently deleted.</p>`);
        res.json({ success: true, message: "User deleted", data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.deleteUser = deleteUser;
const banUser = async (req, res) => {
    try {
        const user = await AdminService.banUser(req.params.userId);
        await (0, email_helper_1.sendMail)(user.email, "Account Suspended", `<p>Your account has been suspended.</p>`);
        res.json({ success: true, message: "User banned", data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.banUser = banUser;
const unbanUser = async (req, res) => {
    try {
        const user = await AdminService.unbanUser(req.params.userId);
        await (0, email_helper_1.sendMail)(user.email, "Account Restored", `<p>Your account has been unbanned.</p>`);
        res.json({ success: true, message: "User unbanned", data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.unbanUser = unbanUser;
const promoteToAdmin = async (req, res) => {
    try {
        const user = await AdminService.promoteUserToAdmin(req.params.userId);
        await (0, email_helper_1.sendMail)(user.email, "You're Now an Admin", `<p>You have been granted admin privileges.</p>`);
        res.json({ success: true, message: "User promoted to ADMIN", data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.promoteToAdmin = promoteToAdmin;
const getAllUsersByRole = async (req, res) => {
    try {
        const users = await AdminService.getUsersByRole(req.query.role);
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(400).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getAllUsersByRole = getAllUsersByRole;
const getNewUsersByRange = async (req, res) => {
    try {
        const users = await AdminService.getNewUsersByRange(req.query.range);
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(400).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getNewUsersByRange = getNewUsersByRange;
const getDailyActiveUsers = async (_req, res) => {
    try {
        const users = await AdminService.getDailyActiveUsers();
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getDailyActiveUsers = getDailyActiveUsers;
// ====================== PRODUCTS ======================
const getAllProducts = async (_req, res) => {
    try {
        const products = await AdminService.getAllProducts();
        res.json({ success: true, data: products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getAllProducts = getAllProducts;
const getSoldProducts = async (_req, res) => {
    try {
        const products = await AdminService.getSoldProducts();
        res.json({ success: true, data: products });
    }
    catch (error) {
        res.status(400).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getSoldProducts = getSoldProducts;
const getProductDetail = async (req, res) => {
    try {
        const product = await AdminService.getProductDetail(req.params.productId);
        if (!product)
            return res.status(404).json({ success: false, message: "Product not found" });
        res.json({ success: true, data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getProductDetail = getProductDetail;
const deleteProduct = async (req, res) => {
    try {
        const product = await AdminService.deleteProduct(req.params.productId);
        res.json({ success: true, message: "Product deleted", data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.deleteProduct = deleteProduct;
const approveProduct = async (req, res) => {
    try {
        const product = await AdminService.approveProduct(req.params.productId);
        const vendor = await AdminService.getUserDetail(product.vendorId);
        if (vendor?.email) {
            await (0, email_helper_1.sendMail)(vendor.email, "Product Approved", `<p>Your product "${product.productName}" has been approved.</p>`);
        }
        res.json({ success: true, message: "Product approved", data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.approveProduct = approveProduct;
const suspendProduct = async (req, res) => {
    try {
        const product = await AdminService.suspendProduct(req.params.productId);
        res.json({ success: true, message: "Product suspended", data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.suspendProduct = suspendProduct;
const rejectProduct = async (req, res) => {
    try {
        const { reason } = req.body;
        const product = await AdminService.rejectProduct(req.params.productId, reason);
        const vendor = await AdminService.getUserDetail(product.vendorId);
        if (vendor?.email) {
            await (0, email_helper_1.sendMail)(vendor.email, "Product Rejected", `<p>Your product "${product.productName}" was rejected. Reason: ${reason}</p>`);
        }
        res.json({ success: true, message: "Product rejected", data: product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.rejectProduct = rejectProduct;
// ====================== DISPUTES ======================
const getAllDisputes = async (_req, res) => {
    try {
        const disputes = await AdminService.getAllDisputes();
        res.json({ success: true, data: disputes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getAllDisputes = getAllDisputes;
const resolveDispute = async (req, res) => {
    try {
        const { resolution } = req.body;
        const dispute = await AdminService.resolveDispute(req.params.disputeId, resolution);
        const user = await AdminService.getUserDetail(dispute.raisedById);
        await (0, email_helper_1.sendMail)(user.email, "Dispute Resolved", `<p>Your dispute has been resolved: ${resolution}</p>`);
        res.json({ success: true, message: "Dispute resolved", data: dispute });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.resolveDispute = resolveDispute;
// ====================== ORDERS ======================
const getAllOrders = async (_req, res) => {
    try {
        const orders = await AdminService.getAllOrders();
        res.json({ success: true, data: orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getAllOrders = getAllOrders;
// export const getOrderTrackingInfo = async (req: Request, res: Response) => {
//   try {
//     const order = await AdminService.getOrderTrackingInfo(req.params.orderId);
//     res.json({ success: true, data: order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: getErrorMessage(error) });
//   }
// };
// ====================== PAYMENTS ======================
const getAllPayments = async (_req, res) => {
    try {
        const payments = await AdminService.getAllPayments();
        res.json({ success: true, data: payments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getAllPayments = getAllPayments;
// ====================== BOOKINGS ======================
const getAllBookings = async (_req, res) => {
    try {
        const bookings = await AdminService.getAllBookings();
        res.json({ success: true, data: bookings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getAllBookings = getAllBookings;
const getAllBookingsDetailed = async (_req, res) => {
    try {
        const bookings = await AdminService.getAllBookingsDetailed();
        res.json({ success: true, data: bookings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: getErrorMessage(error) });
    }
};
exports.getAllBookingsDetailed = getAllBookingsDetailed;
