import { Request, Response } from "express";
import {

  registerUser,
  resetPassword,
  requestPasswordReset,
} from "../services/auth.service";
import { loginWithVendorCheck } from "../services/auth.service";
import { sendOtpService, verifyOtpService } from "../services/otp.service";

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role, acceptedPersonalData, phone } = req.body;
  console.log("➡️ Register attempt:", { email, role });

  try {
    const user = await registerUser(email, password, firstName, lastName, role, acceptedPersonalData, phone);
    console.log("✅ User registered:", user.id);

    await sendOtpService(email);
    console.log("📨 OTP sent to email after registration");

    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to email.",
      data: user,
    });
  } catch (err: any) {
    console.error("❌ Registration failed:", err.message);
    return res.status(400).json({
      success: false,
      message: "Registration failed",
      error: err.message,
    });
  }
};



export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("➡️ Login attempt:", email);

  try {
    const { token, user, vendorProfile, message } = await loginWithVendorCheck(email, password);

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. An OTP has been sent to your email.",
      });
    }

    if (message) {
      return res.status(403).json({
        success: false,
        message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
      vendorProfile,
    });
  } catch (err: any) {
    console.error("❌ Login failed:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid login credentials",
      error: err.message,
    });
  }
};

export const requestReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log("➡️ Password reset requested for:", email);

  try {
    await requestPasswordReset(email);
    console.log("📨 Reset token sent to:", email);

    return res.status(200).json({
      success: true,
      message: "Reset token sent to your email",
    });
  } catch (err: any) {
    console.error("❌ Password reset request failed:", err.message);
    return res.status(400).json({
      success: false,
      message: "Failed to send reset token",
      error: err.message,
    });
  }
};

export const reset = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  const { token } = req.params;
  console.log("➡️ Password reset attempt:", { email, token });

  try {
    await resetPassword(email, token, newPassword);
    console.log("✅ Password reset successful");

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err: any) {
    console.error("❌ Password reset failed:", err.message);
    return res.status(400).json({
      success: false,
      message: "Password reset failed",
      error: err.message,
    });
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log("➡️ Sending OTP to:", email);

  try {
    await sendOtpService(email);
    console.log("✅ OTP sent successfully");

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err: any) {
    console.error("❌ Failed to send OTP:", err.message);
    return res.status(400).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message,
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  console.log("➡️ Verifying OTP:", { email, otp });

  try {
    await verifyOtpService(email, otp);
    console.log("✅ OTP verified successfully");

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err: any) {
    console.error("❌ OTP verification failed:", err.message);
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
      error: err.message,
    });
  }
};
