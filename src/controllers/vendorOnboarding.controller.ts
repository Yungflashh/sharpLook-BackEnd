import { Request, Response } from "express"
import { registerUser } from "../services/auth.service"
import  {createVendorOnboarding}  from "../services/vendorOnboarding.service"
import { sendOtpService } from "../services/otp.service"
import uploadToCloudinary from "../utils/cloudinary"



export const registerVendor = async (req: Request, res: Response) => {
  try {
    const {firstName, lastName, email, password, role,  } = req.body;
    let {acceptedPersonalData} = req.body
   
    
    if (!req.file) {
      return res.status(400).json({ error: "No identity image uploaded" });
    }

    // Get buffer and mimetype from multer file
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // Upload to Cloudinary
    const { secure_url } = await uploadToCloudinary(fileBuffer, mimeType);

   if(acceptedPersonalData == "True"){
      acceptedPersonalData = true
    }
    const user = await registerUser(firstName, lastName, email, password, role, acceptedPersonalData!);

    // Create vendor onboarding with Cloudinary image URL
    await createVendorOnboarding(
  user.id,
  req.body.serviceType,
  secure_url,
  req.body.registerationNumber
);


    // Send OTP
    await sendOtpService(user.email);

    res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      data: {
        user,
        identityImage: secure_url, // ✅ Include URL in response
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

