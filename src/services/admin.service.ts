// src/services/admin.service.ts
import prisma from "../config/prisma"

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


export const promoteUserToAdmin = async (userId: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  })
}
