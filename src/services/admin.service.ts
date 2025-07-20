// src/services/admin.service.ts
import prisma from "../config/prisma"
import { Role } from "@prisma/client"
import { subDays, subWeeks, subMonths, subYears } from "date-fns";


export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: { id: true, email: true, role: true, isEmailVerified: true },
  })
}

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
