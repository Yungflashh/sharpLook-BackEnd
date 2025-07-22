"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAVendorService = exports.updateVendorService = exports.fetchAllVendorServices = exports.fetchVendorServices = exports.createVendorService = void 0;
const vendorService_service_1 = require("../services/vendorService.service");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const createVendorService = async (req, res) => {
    console.log("➡️ [VendorService] Incoming request to create vendor service");
    // 1. Extract data
    const { serviceName, servicePrice, description } = req.body;
    const serviceImage = req.file;
    console.log("Here u go ", req.user);
    const userId = req.user?.id;
    console.log("📥 Request body:", { serviceName, servicePrice });
    console.log("📥 Image received:", !!serviceImage);
    console.log("📥 Vendor ID:", userId);
    // 2. Validate input
    if (!serviceImage || !serviceName || !servicePrice || !description) {
        console.warn("⚠️ Missing required fields");
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        // 3. Upload image to Cloudinary
        console.log("☁️ Uploading image...");
        const upload = await (0, cloudinary_1.default)(serviceImage.buffer, "vendor_services");
        console.log("✅ Image uploaded:", upload.secure_url);
        // 4. Save service to database
        console.log("🛠️ Creating service...");
        const service = await (0, vendorService_service_1.addVendorService)(userId, serviceName, parseFloat(servicePrice), upload.secure_url, description);
        console.log("✅ Service created:", service.id);
        // 5. Return success response
        return res.status(201).json({
            success: true,
            message: "Vendor service created successfully",
            data: service,
        });
    }
    catch (err) {
        // 6. Handle error
        console.error("❌ Error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Failed to create vendor service",
            error: err.message,
        });
    }
};
exports.createVendorService = createVendorService;
const fetchVendorServices = async (req, res) => {
    try {
        console.log("🔐 Fetching vendor services...");
        // 1. Extract and log vendorId and user info
        const vendorId = req.user?.id;
        // const userId = req.user?.id;
        const userRole = req.user?.role;
        // console.log("👤 Authenticated User ID:", userId);
        console.log("🎭 Role:", userRole);
        console.log("🆔 Vendor ID from token:", vendorId);
        // 2. Fetch vendor services
        const services = await (0, vendorService_service_1.getVendorServices)(vendorId);
        // 3. Log the fetched services
        console.log("📦 Fetched Services:", services);
        // 4. Return services
        res.json({ success: true, data: services });
    }
    catch (err) {
        console.error("❌ Error fetching vendor services:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};
exports.fetchVendorServices = fetchVendorServices;
// ✅ Fetch all services (admin/global view)
const fetchAllVendorServices = async (_req, res) => {
    try {
        const services = await (0, vendorService_service_1.getAllServices)();
        res.status(200).json({ success: true, data: services });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch all services", error: err.message });
    }
};
exports.fetchAllVendorServices = fetchAllVendorServices;
// ✅ Update vendor service
const updateVendorService = async (req, res) => {
    const { serviceId } = req.params;
    const { serviceName, serviceImage, description } = req.body;
    const servicePrice = req.body?.servicePrice
        ? parseFloat(req.body.servicePrice)
        : undefined;
    // ✅ Build only provided fields
    const updateData = {};
    if (serviceName)
        updateData.serviceName = serviceName;
    if (servicePrice)
        updateData.servicePrice = servicePrice;
    if (serviceImage)
        updateData.serviceImage = serviceImage;
    if (description)
        updateData.description = description;
    // ✅ Check if updateData is still empty
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
            success: false,
            message: "No valid fields provided for update",
        });
    }
    try {
        const updated = await (0, vendorService_service_1.editVendorService)(serviceId, updateData);
        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: updated,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update service",
            error: err.message,
        });
    }
};
exports.updateVendorService = updateVendorService;
// ✅ Delete vendor service
const deleteAVendorService = async (req, res) => {
    const { serviceId } = req.params;
    try {
        await (0, vendorService_service_1.deleteVendorService)(serviceId);
        res.status(200).json({
            success: true,
            message: "Service deleted successfully",
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete service",
            error: err.message,
        });
    }
};
exports.deleteAVendorService = deleteAVendorService;
