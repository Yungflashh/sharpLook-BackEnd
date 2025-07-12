// src/utils/otp.ts
export const generateOTP = (length = 6): string => {
  return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length)
}

export const otpExpiry = (): Date => {
  const expiry = new Date()
  expiry.setMinutes(expiry.getMinutes() + 10) 
  return expiry
}
