import { Request, Response } from "express";
import * as AdminService from "../services/admin.service";
import { Role } from "@prisma/client";
import { sendMail } from "../helpers/email.helper";

// Utility to extract error message safely
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Internal server error";

// ====================== USERS ======================

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await AdminService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getUserDetail = async (req: Request, res: Response) => {
  try {
    const user = await AdminService.getUserDetail(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await AdminService.deleteUser(req.params.userId);
    await sendMail(user!.email, "Account Deleted", `<p>Your account has been permanently deleted.</p>`);
    res.json({ success: true, message: "User deleted", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const user = await AdminService.banUser(req.params.userId);
    await sendMail(user!.email, "Account Suspended", `<p>Your account has been suspended.</p>`);
    res.json({ success: true, message: "User banned", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const unbanUser = async (req: Request, res: Response) => {
  try {
    const user = await AdminService.unbanUser(req.params.userId);
    await sendMail(user!.email, "Account Restored", `<p>Your account has been unbanned.</p>`);
    res.json({ success: true, message: "User unbanned", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const user = await AdminService.promoteUserToAdmin(req.params.userId);
    await sendMail(user!.email, "You're Now an Admin", `<p>You have been granted admin privileges.</p>`);
    res.json({ success: true, message: "User promoted to ADMIN", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getAllUsersByRole = async (req: Request, res: Response) => {
  try {
    const users = await AdminService.getUsersByRole(req.query.role as Role);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getNewUsersByRange = async (req: Request, res: Response) => {
  try {
    const users = await AdminService.getNewUsersByRange(req.query.range as string);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getDailyActiveUsers = async (_req: Request, res: Response) => {
  try {
    const users = await AdminService.getDailyActiveUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

// ====================== PRODUCTS ======================

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await AdminService.getAllProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getSoldProducts = async (_req: Request, res: Response) => {
  try {
    const products = await AdminService.getSoldProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(400).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getProductDetail = async (req: Request, res: Response) => {
  try {
    const product = await AdminService.getProductDetail(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await AdminService.deleteProduct(req.params.productId);
    res.json({ success: true, message: "Product deleted", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const approveProduct = async (req: Request, res: Response) => {
  try {
    const product = await AdminService.approveProduct(req.params.productId);
    const vendor = await AdminService.getUserDetail(product.vendorId);
    if (vendor?.email) {
      await sendMail(vendor.email, "Product Approved", `<p>Your product "${product.productName}" has been approved.</p>`);
    }
    res.json({ success: true, message: "Product approved", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const suspendProduct = async (req: Request, res: Response) => {
  try {
    const product = await AdminService.suspendProduct(req.params.productId);
    res.json({ success: true, message: "Product suspended", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const rejectProduct = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const product = await AdminService.rejectProduct(req.params.productId, reason);
    const vendor = await AdminService.getUserDetail(product.vendorId);
    if (vendor?.email) {
      await sendMail(vendor.email, "Product Rejected", `<p>Your product "${product.productName}" was rejected. Reason: ${reason}</p>`);
    }
    res.json({ success: true, message: "Product rejected", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

// ====================== DISPUTES ======================

export const getAllDisputes = async (_req: Request, res: Response) => {
  try {
    const disputes = await AdminService.getAllDisputes();
    res.json({ success: true, data: disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { resolution } = req.body;
    const dispute = await AdminService.resolveDispute(req.params.disputeId, resolution);
    const user = await AdminService.getUserDetail(dispute.raisedById);
    await sendMail(user!.email, "Dispute Resolved", `<p>Your dispute has been resolved: ${resolution}</p>`);
    res.json({ success: true, message: "Dispute resolved", data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

// ====================== ORDERS ======================

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await AdminService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

// export const getOrderTrackingInfo = async (req: Request, res: Response) => {
//   try {
//     const order = await AdminService.getOrderTrackingInfo(req.params.orderId);
//     res.json({ success: true, data: order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: getErrorMessage(error) });
//   }
// };

// ====================== PAYMENTS ======================

export const getAllPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await AdminService.getAllPayments();
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

// ====================== BOOKINGS ======================

export const getAllBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await AdminService.getAllBookings();
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};

export const getAllBookingsDetailed = async (_req: Request, res: Response) => {
  try {
    const bookings = await AdminService.getAllBookingsDetailed();
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
};
