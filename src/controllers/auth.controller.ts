import { Request, Response } from "express"
import { loginUser, registerUser, resetPassword ,requestPasswordReset} from "../services/auth.service"
import { sendOtpService, verifyOtpService} from "../services/otp.service"

export const register = async (req: Request, res: Response) => {
  const {firstName, lastName, email, password, role, acceptedPersonalData,  } = req.body
  try {
      const user = await registerUser(email, password, firstName, lastName, role, acceptedPersonalData)
      res.status(201).json({
      success: true,
       message: "User registered successfully. OTP sent to email.",
       data: user
      })

  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { token, user } = await loginUser(email, password);

    
    if (!user.isEmailVerified) {
      await sendOtpService(email);
      return res.status(403).json({
        error: "Email not verified. An Otp Code has been sent to Your email.",
      });
    }
    res.status(200).json({ token, user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};



export const requestReset = async (req: Request, res: Response) => {
  try {
    await requestPasswordReset(req.body.email)
    res.json({ message: "Reset token sent to your email" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const reset = async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body
  try {
    await resetPassword(email, token, newPassword)
    res.json({ message: "Password reset successful" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}







export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    await sendOtpService(email)
    res.json({ message: "OTP sent to email (simulated)" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body
    await verifyOtpService(email, otp)
    res.json({ message: "OTP verified successfully" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}



