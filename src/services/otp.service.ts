// src/services/otp.service.ts
import prisma from "../config/prisma"
import { sendMail } from "../helpers/email.helper"


export const sendOtpService = async (identifier: string) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  })
  if (!user) throw new Error("User not found")

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { otp, otpExpires },
  })

  if (user.email === identifier) {
    await sendMail(
      user.email,
      "Your OTP Code",
      `<p>Your OTP code is: <b>${otp}</b>. It expires in 10 minutes.</p>`
    )
  }

  console.log(`✅ OTP sent to ${identifier}: ${otp}`)
}




export const verifyOtpService = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.otp || !user.otpExpires) {
    throw new Error("OTP not found or expired");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (user.otpExpires < new Date()) {
    throw new Error("OTP has expired");
  }

  // Mark user as verified and clear OTP
  await prisma.user.update({
    where: { email },
    data: {
      isEmailVerified: true,
      isOtpVerified: true,
      otp: null,
      otpExpires: null,
    },
  });
};


