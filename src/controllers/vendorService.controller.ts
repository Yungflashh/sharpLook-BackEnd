import { Request, Response } from "express";
import {
  addVendorService,
  getVendorServices,
  getAllServices,
  editVendorService,
deleteVendorService} from "../services/vendorService.service";
import uploadToCloudinary from "../utils/cloudinary";

export const createVendorService = async (req: Request, res: Response) => {
  console.log("➡️ [VendorService] Incoming request to create vendor service");

  // 1. Extract data
  const { serviceName, servicePrice } = req.body;
  const serviceImage = req.file;

  console.log("Here u go ", req.user);
  
  const vendorId = req.user?.id!;

  console.log("📥 Request body:", { serviceName, servicePrice });
  console.log("📥 Image received:", !!serviceImage);
  console.log("📥 Vendor ID:", vendorId);

  // 2. Validate input
  if (!serviceImage || !serviceName || !servicePrice) {
    console.warn("⚠️ Missing required fields");
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // 3. Upload image to Cloudinary
    console.log("☁️ Uploading image...");
    const upload = await uploadToCloudinary(
      serviceImage.buffer,
      "vendor_services"
    );

    console.log("✅ Image uploaded:", upload.secure_url);

    // 4. Save service to database
    console.log("🛠️ Creating service...");
    const service = await addVendorService(
      vendorId,
      serviceName,
      parseFloat(servicePrice),
      upload.secure_url
    );

    console.log("✅ Service created:", service.id);

    // 5. Return success response
    return res.status(201).json({
      success: true,
      message: "Vendor service created successfully",
      data: service,
    });
  } catch (err: any) {
    // 6. Handle error
    console.error("❌ Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create vendor service",
      error: err.message,
    });
  }
};

export const fetchVendorServices = async (req: Request, res: Response) => {
  try {
    console.log("🔐 Fetching vendor services...");

    // 1. Extract and log vendorId and user info
    const vendorId = req.user?.vendorId!;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    console.log("👤 Authenticated User ID:", userId);
    console.log("🎭 Role:", userRole);
    console.log("🆔 Vendor ID from token:", vendorId);

    // 2. Fetch vendor services
    const services = await getVendorServices(vendorId);

    // 3. Log the fetched services
    console.log("📦 Fetched Services:", services);

    // 4. Return services
    res.json({ success: true, data: services });
  } catch (err: any) {
    console.error("❌ Error fetching vendor services:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};



// ✅ Fetch all services (admin/global view)
export const fetchAllVendorServices = async (_req: Request, res: Response) => {
  try {
    const services = await getAllServices();
    res.status(200).json({ success: true, data: services });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch all services", error: err.message });
  }
};

// ✅ Update vendor service
export const updateVendorService = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const { serviceName, serviceImage } = req.body;

  const servicePrice = req.body?.servicePrice
      ? parseFloat(req.body.servicePrice)
      : undefined;

  // ✅ Build only provided fields
  const updateData: any = {};
  if (serviceName) updateData.serviceName = serviceName;
  if (servicePrice) updateData.servicePrice = servicePrice;
  if (serviceImage) updateData.serviceImage = serviceImage;

  // ✅ Check if updateData is still empty
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields provided for update",
    });
  }

  try {
    const updated = await editVendorService(serviceId, updateData);
    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update service",
      error: err.message,
    });
  }
};

// ✅ Delete vendor service
export const deleteAVendorService = async (req: Request, res: Response) => {
  const { serviceId } = req.params;

  try {
    await deleteVendorService(serviceId);
    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete service",
      error: err.message,
    });
  }
};