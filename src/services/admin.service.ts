// src/services/admin.service.ts
import prisma from "../config/prisma"
import { Role } from "@prisma/client"
import { subDays, subWeeks, subMonths, subYears } from "date-fns";


export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isEmailVerified: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      isBanned: true,
      referralCode: true,
      powerGiven: true,
      preferredLatitude: true,
      preferredLongitude: true,
      preferredRadiusKm: true,
      wallet: {
        select: {
          balance: true,
          status: true,
        },
      },
      vendorOnboarding: {
        select: {
          serviceType: true,
          businessName: true,
          location: true,
          profileImage: true,
        },
      },
    },
  });
};


export const getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: { client: true, vendor: true },
  })
}

export const banUser = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { isBanned: true }, 
  })
}

export const unbanUser = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { isBanned: false },
  })
}


export const promoteUserToAdmin = async (adminId: string) => {

  console.log(adminId);
  
  const user = await prisma.user.findUnique({ where: { id: adminId } });

  if (!user) throw new Error("User not found");

  return await prisma.user.update({
    where: { id: adminId },
    data: {
      role: "ADMIN",
      powerGiven: true, // ✅ Set admin power as granted
    },
  });
};

export const getUsersByRole = async (role: Role) => {
  return await prisma.user.findMany({
    where: { role },
    orderBy: { createdAt: "desc" }
  });
};



export const getNewUsersByRange = async (range: string) => {
  let date: Date;

  switch (range) {
    case "days":
      date = subDays(new Date(), 7);
      break;
    case "weeks":
      date = subWeeks(new Date(), 4);
      break;
    case "months":
      date = subMonths(new Date(), 6);
      break;
    case "years":
      date = subYears(new Date(), 1);
      break;
    default:
      throw new Error("Invalid range");
  }

  return await prisma.user.findMany({
    where: { createdAt: { gte: date } },
    orderBy: { createdAt: "desc" }
  });
};


export const getDailyActiveUsers = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.user.findMany({
    where: { updatedAt: { gte: today } }
  });
};


export const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });
};

export const getSoldProducts = async () => {
  return await prisma.product.findMany({
    where: { qtyAvailable: 0 },
    orderBy: { createdAt: "desc" }
  });
};


export const getUserDetail = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorOnboarding: true,
      wallet: true,
      clientBookings: true,
      vendorBookings: true,
      products: true,
    },
  });
};


export const deleteUser = async (userId: string) => {
  return await prisma.user.delete({ where: { id: userId } });
};


export const getProductDetail = async (productId: string) => {
  return await prisma.product.findUnique({
    where: { id: productId },
    include: {
      vendor: true,
      reviews: true,
    },
  });
};


export const deleteProduct = async (productId: string) => {
  return await prisma.product.delete({ where: { id: productId } });
};


export const approveProduct = async (productId: string) => {
  return await prisma.product.update({
    where: { id: productId },
    data: { status: "approved" },
  });
};


export const suspendProduct = async (productId: string) => {
  return await prisma.product.update({
    where: { id: productId },
    data: { status: "suspended" },
  });
};

export const rejectProduct = async (productId: string, reason?: string) => {
  return await prisma.product.update({
    where: { id: productId },
    data: { status: "rejected", description: reason || "" },
  });
};


export const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" }
  });
};


export const getAllPayments = async () => {
  return await prisma.transaction.findMany({
    include: {
      wallet: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};


export const getAllBookingsDetailed = async () => {
  return await prisma.booking.findMany({
    include: {
      client: true,
      vendor: true,
      review: true,
    },
    orderBy: { createdAt: "desc" }
  });
};


export const getAllDisputes = async () => {
  return await prisma.dispute.findMany({
    include: {
      raisedBy: true,
      booking: true,
    },
    orderBy: { createdAt: "desc" }
  });
};


export const resolveDispute = async (disputeId: string, resolution: string) => {
  return await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "RESOLVED",
      resolution,
    },
  });
};
