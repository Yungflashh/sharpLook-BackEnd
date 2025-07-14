import { Request, Response } from "express"
import { registerUser } from "../services/auth.service"
import  {createVendorOnboarding}  from "../services/vendorOnboarding.service"
import { sendOtpService } from "../services/otp.service"
import uploadToCloudinary from "../utils/cloudinary"



export const registerVendor = async (req: Request, res: Response) => {
   console.log("🔥 registerVendor hit"); // ← add this
  try {
    const {firstName, lastName, email, password, role, phone } = req.body;
    let {acceptedPersonalData} = req.body
   
    if (acceptedPersonalData == "True" || acceptedPersonalData == true || acceptedPersonalData == "true"){
          acceptedPersonalData = true
    }


    
    if (!req.file) {
      return res.status(400).json({ error: "No identity image uploaded" });
    }

    // Get buffer and mimetype from multer file
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    console.log("🖼️ Multer file info:", {
  originalname: req.file.originalname,
  size: req.file.size,
  mimetype: req.file.mimetype
});


   console.log("📦 Uploading to Cloudinary...");
    const { secure_url } = await uploadToCloudinary(fileBuffer, mimeType);
    console.log("✅ Uploaded to Cloudinary:", secure_url);

    const user = await registerUser( email, password,firstName, lastName, role, acceptedPersonalData!, phone);
    console.log("👤 User registered:", user.email);
    // Create vendor onboarding with Cloudinary image URL
    await createVendorOnboarding(
  user.id,
  req.body.serviceType,
  secure_url,
 
  
);
console.log("🚀 Vendor onboarding created");



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

