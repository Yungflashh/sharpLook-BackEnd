"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrders = exports.checkoutCart = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// Notification & email utils
const notification_service_1 = require("./notification.service");
const email_helper_1 = require("../helpers/email.helper");
const wallet_service_1 = require("./wallet.service");
const checkoutCart = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            wallet: true,
            cartItems: {
                include: {
                    product: {
                        include: {
                            vendor: true, // to get vendor info for notification/email
                        },
                    },
                },
            },
        },
    });
    if (!user || !user.wallet)
        throw new Error("User or wallet not found");
    const cartItems = user.cartItems;
    if (cartItems.length === 0)
        throw new Error("Your cart is empty");
    const totalAmount = cartItems.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
    }, 0);
    if (user.wallet.balance < totalAmount)
        throw new Error("Insufficient wallet balance");
    return await prisma_1.default.$transaction(async (tx) => {
        // Debit wallet
        await (0, wallet_service_1.debitWallet)(user.wallet.id, totalAmount, "Cart checkout");
        // Prepare vendor-wise product grouping
        const vendorMap = {};
        const orderItems = [];
        for (const item of cartItems) {
            const vendor = item.product.vendor;
            const vendorId = vendor.id;
            // Update product stats
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    qtyAvailable: { decrement: item.quantity },
                    unitsSold: { increment: item.quantity },
                },
            });
            // Add to order record
            orderItems.push({
                productId: item.productId,
                productName: item.product.productName,
                quantity: item.quantity,
                price: item.product.price,
            });
            // Group items by vendor for notification/email
            if (!vendorMap[vendorId]) {
                vendorMap[vendorId] = {
                    vendorEmail: vendor.email,
                    vendorName: `${vendor.firstName} ${vendor.lastName}`,
                    items: [],
                };
            }
            vendorMap[vendorId].items.push({
                productName: item.product.productName,
                quantity: item.quantity,
                price: item.product.price,
                total: item.quantity * item.product.price,
            });
        }
        // Create Order
        const order = await tx.order.create({
            data: {
                userId,
                items: orderItems,
                total: totalAmount,
            },
        });
        // Clear cart
        await tx.cartItem.deleteMany({ where: { userId } });
        // Notify each vendor
        for (const [vendorId, data] of Object.entries(vendorMap)) {
            const { vendorEmail, vendorName, items } = data;
            const vendorTotal = items.reduce((sum, item) => sum + item.total, 0);
            // In-app notification
            await (0, notification_service_1.createNotification)(vendorId, `You've sold ${items.length} item(s) totaling ₦${vendorTotal}.`);
            // Email notification
            await (0, email_helper_1.sendVendorOrderEmail)(vendorEmail, {
                name: vendorName,
                items,
                total: vendorTotal,
            });
        }
        return order;
    });
};
exports.checkoutCart = checkoutCart;
const getUserOrders = async (userId) => {
    return await prisma_1.default.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};
exports.getUserOrders = getUserOrders;
