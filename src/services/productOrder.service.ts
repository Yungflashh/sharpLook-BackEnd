import prisma from "../config/prisma";
// Notification & email utils
import { createNotification } from "./notification.service";
import { sendVendorOrderEmail } from "../helpers/email.helper";

import { debitWallet, getUserWallet } from "./wallet.service";

export const checkoutCart = async (userId: string, reference: string) => {
  const user = await prisma.user.findUnique({
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

  if (!user || !user.wallet) throw new Error("User or wallet not found");

  const cartItems = user.cartItems;
  if (cartItems.length === 0) throw new Error("Your cart is empty");

  const totalAmount = cartItems.reduce((sum: any, item: any) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  if (user.wallet.balance < totalAmount) throw new Error("Insufficient wallet balance");

  return await prisma.$transaction(async (tx: any) => {
    // Debit wallet with reference
    await debitWallet(user.wallet!.id, totalAmount, "Cart checkout", reference);

    // Prepare vendor-wise product grouping
    const vendorMap: Record<string, {
      vendorEmail: string;
      vendorName: string;
      items: {
        productName: string;
        quantity: number;
        price: number;
        total: number;
      }[];
    }> = {};

    const orderItems = [];

    for (const item of cartItems) {
      const vendor = item.product.vendor!;
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

    // Create Order with reference included
    const order = await tx.order.create({
      data: {
        userId,
        items: orderItems,
        total: totalAmount,
        reference,  // Save the payment/reference here
      },
    });

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    // Notify each vendor
    for (const [vendorId, data] of Object.entries(vendorMap)) {
      const { vendorEmail, vendorName, items } = data;
      const vendorTotal = items.reduce((sum, item) => sum + item.total, 0);

      // In-app notification
      await createNotification(
        vendorId,
        `You've sold ${items.length} item(s) totaling ₦${vendorTotal}.`
      );

      // Email notification
      await sendVendorOrderEmail(vendorEmail, {
        name: vendorName,
        items,
        total: vendorTotal,
      });
    }

    return order;
  });
};

export const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};
