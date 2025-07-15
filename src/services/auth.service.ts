import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../config/prisma"
import { Role } from "@prisma/client"
import { sendOtpService } from "../services/otp.service";
import crypto from "crypto"
import { sendMail } from "../helpers/email.helper"

export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: Role,
  acceptedPersonalData: boolean,
  phone: string,
) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("Email already in use")

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hash,
      role,
      acceptedPersonalData,
      phone
    }
  })

  return user
}


export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  return { token, user };
};

export const loginWithVendorCheck = async (email: string, password: string) => {
  const { token, user } = await loginUser(email, password);

  // Check if email is verified
  if (!user.isEmailVerified) {
    await sendOtpService(email);
    return { token, user };
  }

  let vendorProfile = null;
  let message: string | undefined = undefined;

  if (user.role === "VENDOR") {
    vendorProfile = await prisma.vendorOnboarding.findUnique({
      where: { userId: user.id },
    });

    if (!vendorProfile) {
      message = "Vendor profile not found. Please complete onboarding.";
    } else if (!vendorProfile.registerationNumber) {
      message = "Please complete your vendor profile (missing registration number).";
    } else if (
      vendorProfile.latitude === null || vendorProfile.latitude === undefined ||
      vendorProfile.longitude === null || vendorProfile.longitude === undefined
    ) {
      message = "Please complete your vendor profile (missing location coordinates).";
    }
  }

  return { token, user, vendorProfile, message };
};


export const resetPassword = async (email: string, token: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.resetToken !== token || user.resetTokenExp! < new Date()) {
    throw new Error("Invalid or expired token")
  }

  const hashed = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { email },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExp: null,
    },
  })
}



export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error("User not found")

  const token = crypto.randomBytes(32).toString("hex")
  const tokenExp = new Date(Date.now() + 1000 * 60 * 10)

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExp: tokenExp },
  })

  await sendMail(
    email,
    "Password Reset Token",
    `<p>Use this token to reset your password: <b>${token}</b></p>`
  )
}




export const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorOnboarding: true,
      clientBookings: true,
      vendorBookings: true,
      products: true,
      vendorAvailabilities: true,
      promotions: true,
      vendorReviews: true,
      clientReviews: true,
      notifications: true,
    },
  });
};
