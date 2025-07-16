import { Request, Response } from "express"
import { addVendorService, getVendorServices } from "../services/vendorService.service"
import  uploadToCloudinary  from "../utils/cloudinary"


export const createVendorService = async (req: Request, res: Response) => {
  console.log("➡️ [VendorService] Incoming request to create vendor service");

  const { serviceName, servicePrice } = req.body;
  const serviceImage = req.file;
  const vendorId = req.user?.id!;

  console.log("📥 [VendorService] Request body:", { serviceName, servicePrice });
  console.log("📥 [VendorService] serviceImage received:", !!serviceImage);
  console.log("📥 [VendorService] Vendor ID:", vendorId);

  if (!serviceImage || !serviceName || !servicePrice) {
    console.warn("⚠️ [VendorService] Missing required fields");
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    console.log("☁️ [VendorService] Uploading serviceImage to Cloudinary...");
    const upload = await uploadToCloudinary(serviceImage.buffer, "vendor_services");

    console.log("✅ [VendorService] serviceImage uploaded successfully:", upload.secure_url);

    console.log("🛠️ [VendorService] Creating service record in database...");
    const service = await addVendorService(
      vendorId,
      serviceName,
      parseFloat(servicePrice),
      upload.secure_url
    );

    console.log("✅ [VendorService] Service created successfully:", service.id);

    return res.status(201).json({
      success: true,
      message: "Vendor service created successfully",
      data: service,
    });
  } catch (err: any) {
    console.error("❌ [VendorService] Error creating vendor service:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create vendor service",
      error: err.message,
    });
  }
};


export const fetchVendorServices = async (req: Request, res: Response) => {
  const vendorId = req.user?.id!

  try {
    const services = await getVendorServices(vendorId)
    res.json({ success: true, data: services })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}


