"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPortfolioImages = exports.uploadPortfolioImages = exports.completeVendorProfile = void 0;
const vendorOnboarding_service_1 = require("../services/vendorOnboarding.service");
const vendor_services_1 = require("../services/vendor.services");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const completeVendorProfile = async (req, res) => {
    try {
        const updated = await (0, vendorOnboarding_service_1.updateVendorProfile)(req.user.id, req.body);
        res.json({ success: true, message: "Profile updated", data: updated });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.completeVendorProfile = completeVendorProfile;
const uploadPortfolioImages = async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: "No images uploaded" });
        }
        const uploadResults = await Promise.all(req.files.map((file) => (0, cloudinary_1.default)(file.buffer, file.mimetype)));
        const urls = uploadResults.map(result => result.secure_url);
        const updated = await (0, vendor_services_1.addPortfolioImages)(req.user.id, urls);
        res.json({ success: true, message: "Portfolio images uploaded", data: updated });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload portfolio images" });
    }
};
exports.uploadPortfolioImages = uploadPortfolioImages;
const fetchPortfolioImages = async (req, res) => {
    try {
        const portfolio = await (0, vendor_services_1.getPortfolioImages)(req.user.id);
        res.json({ success: true, data: portfolio });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch portfolio images" });
    }
};
exports.fetchPortfolioImages = fetchPortfolioImages;
