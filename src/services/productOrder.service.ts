import prisma from "../config/prisma";
// Notification & email utils
import { createNotification } from "./notification.service";
import { sendVendorOrderEmail } from "../helpers/email.helper";

import { debitWallet, getUserWallet } from "./wallet.service";

export const checkoutCart = async (userId: string, reference?: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      cartItems: {
        include: {
          product: {
            include: {
              vendor: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.wallet) throw new Error("User or wallet not found");
  const cartItems = user.cartItems;
  if (cartItems.length === 0) throw new Error("Your cart is empty");

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  if (!reference && user.wallet.balance < totalAmount) {
    throw new Error("Insufficient wallet balance");
  }

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

  const orderItems: any = [];

  for (const item of cartItems) {
    const vendor = item.product.vendor!;
    const vendorId = vendor.id;

    orderItems.push({
      productId: item.productId,
      productName: item.product.productName,
      quantity: item.quantity,
      price: item.product.price,
    });

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

  // Now perform DB operations inside the transaction only
  const order = await prisma.$transaction(async (tx) => {
    if (!reference) {
      await debitWallet(user.wallet!.id, totalAmount, "Cart checkout", "WALLET-CHECKOUT");
    }

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          qtyAvailable: { decrement: item.quantity },
          unitsSold: { increment: item.quantity },
        },
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        items: orderItems,
        total: totalAmount,
        reference: reference ?? "WALLET-CHECKOUT",
      },
    });

    await tx.cartItem.deleteMany({ where: { userId } });

    return order;
  });

  // Now send notifications/emails AFTER transaction completes
  for (const [vendorId, data] of Object.entries(vendorMap)) {
    const { vendorEmail, vendorName, items } = data;
    const vendorTotal = items.reduce((sum, item) => sum + item.total, 0);

    await createNotification(
      vendorId,
      `You've sold ${items.length} item(s) totaling ₦${vendorTotal}.`
    );

  await sendVendorOrderEmail(vendorEmail, {
  name: vendorName,
  clientName: `${user.firstName} ${user.lastName}`,
  phone: `${user.phone}`,
  items,
  total: vendorTotal,
});
  }

  return order;
};


export const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};
