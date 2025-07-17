"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVendorServices = exports.createVendorService = void 0;
const vendorService_service_1 = require("../services/vendorService.service");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const createVendorService = async (req, res) => {
    console.log("➡️ [VendorService] Incoming request to create vendor service");
    // 1. Extract data
    const { serviceName, servicePrice } = req.body;
    const serviceImage = req.file;
    const vendorId = req.user?.id;
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
        const upload = await (0, cloudinary_1.default)(serviceImage.buffer, "vendor_services");
        console.log("✅ Image uploaded:", upload.secure_url);
        // 4. Save service to database
        console.log("🛠️ Creating service...");
        const service = await (0, vendorService_service_1.addVendorService)(vendorId, serviceName, parseFloat(servicePrice), upload.secure_url);
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
    const vendorId = req.user?.id;
    try {
        // 1. Get vendor services from DB
        const services = await (0, vendorService_service_1.getVendorServices)(vendorId);
        // 2. Return response
        res.json({ success: true, data: services });
    }
    catch (err) {
        // 3. Handle error
        res.status(500).json({ error: err.message });
    }
};
exports.fetchVendorServices = fetchVendorServices;
