import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../config/prisma"
import { Role } from "@prisma/client"
import crypto from "crypto"
import { sendMail } from "../helpers/email.helper"
import {
  BaseLoginResponse,
  VendorLoginResponse,
  ClientLoginResponse,
} from "../types/auth.types";

import { generateReferralCode } from "../utils/referral";
import { createWallet, creditWallet } from "./wallet.service";
export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: Role,
  acceptedPersonalData: boolean,
  phone: string,
  referredByCode?: string
) => {
  console.log("➡️ Starting user registration...");
  console.log("Incoming data:", { email, referredByCode });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("❌ User already exists with email:", email);
    throw new Error("Email already in use");
  }

  const hash = await bcrypt.hash(password, 10);
  console.log("🔒 Password hashed");

  const referralCode = generateReferralCode();
  console.log("🎁 Generated referral code:", referralCode);

  const userData: any = {
    firstName,
    lastName,
    email,
    password: hash,
    role,
    acceptedPersonalData,
    phone,
    referralCode,
  };

  let referredByUser: any = null;

  // ✅ Handle referral code connection
  if (referredByCode) {
    console.log("🔍 Looking up referrer by referralCode:", referredByCode);
    referredByUser = await prisma.user.findUnique({
      where: { referralCode: referredByCode },
    });

    if (referredByUser) {
      console.log("✅ Found referrer user:", referredByUser.id);
      userData.referredBy = {
        connect: { id: referredByUser.id },
      };
    } else {
      console.log("⚠️ No user found with referralCode:", referredByCode);
    }
  }

  // ✅ Create the user
  console.log("📦 Creating user with data:", userData);
  const user = await prisma.user.create({ data: userData });

  // ✅ Create wallet for user
  console.log("💰 Creating wallet for new user...");
  const userWallet = await prisma.wallet.create({
    data: {
      userId: user.id,
      balance: 0,
      status: "ACTIVE",
    },
  });

  // ✅ Link wallet to user
  console.log("🔗 Linking wallet to user...");
  await prisma.user.update({
    where: { id: user.id },
    data: { walletId: userWallet.id },
  });

  // ✅ Credit wallets if there's a referrer
  if (referredByUser?.walletId) {
    console.log("💸 Crediting referrer's wallet:", referredByUser.walletId);
    await creditWallet(referredByUser.walletId, 100);

    console.log("🎉 Crediting new user's wallet:", userWallet.id);
    await creditWallet(userWallet.id, 100);

    await prisma.referral.create({
    data: {
      referredById: referredByUser.id,
      referredUserId: user.id,
      amountEarned: 100,
    },
  });


  } else {
    console.log("ℹ️ No valid referrer to credit.");
  }

  // ✅ Final user fetch including referredBy name
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      referredBy: {
        select: {
          firstName: true,
          lastName: true,
          referralCode: true,
        },
      },
    },
  });

  if (!updatedUser) {
    console.log("❌ Could not retrieve updated user.");
    throw new Error("User registration failed during final fetch.");
  }

  console.log("✅ User registered:", updatedUser.id);
  return updatedUser;
};



export const loginUser = async (email: string, password: string): Promise<BaseLoginResponse> => {
  const user = await prisma.user.findUnique({
  where: { email },
  include: {
    vendorOnboarding: true, 
  },
});
;
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  return { token, user };
};

export const loginWithClientCheck = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

 const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role,
     // ✅ get vendor ID from the related record
  },
  process.env.JWT_SECRET!,
  { expiresIn: "7d" }
);
  let message: string | undefined;

  if (user.role === "CLIENT") {
    if (user.preferredLatitude == null || user.preferredLongitude == null) {
      message = "No Location";
    }
  }

  return { token, user, message };
};


export const loginWithVendorCheck = async (email: string, password: string): Promise<VendorLoginResponse> => {
   const user = await prisma.user.findUnique({
  where: { email },
  include: {
    vendorOnboarding: true, // 👈 this tells Prisma to load the related data
  },
});
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id, role: user.role}, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  const existingVendorProfile = await prisma.vendorOnboarding.findUnique({
  where: { userId: user.id },
});

  let vendorProfile = await prisma.vendorOnboarding.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      identityImage: "",
      serviceType:existingVendorProfile!.serviceType,
      specialties: [],
      portfolioImages: [],
    },
  });

  let message: string | undefined;
  if (!vendorProfile.businessName) {
    message = "Please complete your vendor profile (business Name required).";
  } else if (vendorProfile.latitude == null || vendorProfile.longitude == null) {
    message = "No Location";
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
      // promotions: true,
      vendorReviews: true,
      clientReviews: true,
      notifications: true,
    },
  });
};
