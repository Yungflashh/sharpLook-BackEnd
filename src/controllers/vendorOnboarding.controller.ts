import { Request, Response } from "express"
import { registerUser } from "../services/auth.service"
import  {createVendorOnboarding}  from "../services/vendorOnboarding.service"
import { sendOtpService } from "../services/otp.service"
import uploadToCloudinary from "../utils/cloudinary"



export const registerVendor = async (req: Request, res: Response) => {
  try {
    // 1. Extract required fields from request body
    const { firstName, lastName, email, password, role, phone, serviceType } = req.body;
    let { acceptedPersonalData } = req.body;

    // 2. Normalize boolean for acceptedPersonalData
    if (acceptedPersonalData == "True" || acceptedPersonalData == true || acceptedPersonalData == "true") {
      acceptedPersonalData = true;
    }

    // 3. Check if identity image is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No identity image uploaded" });
    }

    // 4. Extract file buffer and mimetype from multer file
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // 5. Upload image to Cloudinary
    const { secure_url } = await uploadToCloudinary(fileBuffer, mimeType);

    // 6. Register the user (role: VENDOR)
    const user = await registerUser(
      email,
      password,
      firstName,
      lastName,
      role,
      acceptedPersonalData!,
      phone
    );

    // 7. Create vendor onboarding with Cloudinary image
    await createVendorOnboarding(
      user.id,
      serviceType,
      secure_url
    );

    await sendOtpService(email)
    // 8. Return successful response
    res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      data: {
        user,
        identityImage: secure_url
      }
    });
  } catch (err: any) {
    // 9. Handle errors
    res.status(400).json({ error: err.message });
  }
};

