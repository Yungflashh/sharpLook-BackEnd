"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVendor = void 0;
const auth_service_1 = require("../services/auth.service");
const vendorOnboarding_service_1 = require("../services/vendorOnboarding.service");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const registerVendor = async (req, res) => {
    console.log("🔥 registerVendor hit"); // ← add this
    try {
        const { firstName, lastName, email, password, role, phone } = req.body;
        let { acceptedPersonalData } = req.body;
        if (acceptedPersonalData == "True" || acceptedPersonalData == true || acceptedPersonalData == "true") {
            acceptedPersonalData = true;
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
        const { secure_url } = await (0, cloudinary_1.default)(fileBuffer, mimeType);
        console.log("✅ Uploaded to Cloudinary:", secure_url);
        const user = await (0, auth_service_1.registerUser)(email, password, firstName, lastName, role, acceptedPersonalData, phone);
        console.log("👤 User registered:", user.email);
        // Create vendor onboarding with Cloudinary image URL
        await (0, vendorOnboarding_service_1.createVendorOnboarding)(user.id, req.body.serviceType, secure_url);
        console.log("🚀 Vendor onboarding created");
        res.status(201).json({
            success: true,
            message: "Vendor registered successfully",
            data: {
                user,
                identityImage: secure_url, // ✅ Include URL in response
            }
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.registerVendor = registerVendor;
