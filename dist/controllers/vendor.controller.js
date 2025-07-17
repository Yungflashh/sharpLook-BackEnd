"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterVendorsByService = exports.fetchAllServiceCategories = exports.getNearbyVendors = exports.updateServiceRadius = exports.fetchAvailability = exports.updateAvailability = exports.fetchPortfolioImages = exports.uploadPortfolioImages = exports.completeVendorProfile = void 0;
const vendorOnboarding_service_1 = require("../services/vendorOnboarding.service");
const vendor_services_1 = require("../services/vendor.services");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const completeVendorProfile = async (req, res) => {
    try {
        const updated = await (0, vendorOnboarding_service_1.updateVendorProfile)(req.user.id, req.body);
        res.json({ success: true, message: "Profile updated", data: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, message: "Failed to update profile", error: err.message });
    }
};
exports.completeVendorProfile = completeVendorProfile;
const uploadPortfolioImages = async (req, res) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No images uploaded", error: "No images provided" });
        }
        const uploadResults = await Promise.all(req.files.map((file) => (0, cloudinary_1.default)(file.buffer, file.mimetype)));
        const urls = uploadResults.map(result => result.secure_url);
        const updated = await (0, vendor_services_1.addPortfolioImages)(req.user.id, urls);
        res.json({ success: true, message: "Portfolio images uploaded", data: updated });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Failed to upload portfolio images", error: err.message });
    }
};
exports.uploadPortfolioImages = uploadPortfolioImages;
const fetchPortfolioImages = async (req, res) => {
    try {
        const portfolio = await (0, vendor_services_1.getPortfolioImages)(req.user.id);
        res.json({ success: true, message: "Fetched portfolio images", data: portfolio });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch portfolio images", error: err.message });
    }
};
exports.fetchPortfolioImages = fetchPortfolioImages;
const updateAvailability = async (req, res) => {
    const { days, fromTime, toTime } = req.body;
    try {
        const availability = await (0, vendor_services_1.setVendorAvailability)(req.user.id, days, fromTime, toTime);
        res.json({ success: true, message: "Availability updated", data: availability });
    }
    catch (err) {
        res.status(400).json({ success: false, message: "Failed to update availability", error: err.message });
    }
};
exports.updateAvailability = updateAvailability;
const fetchAvailability = async (req, res) => {
    try {
        const availability = await (0, vendor_services_1.getVendorAvailability)(req.user.id);
        res.json({ success: true, message: "Fetched availability", data: availability });
    }
    catch (err) {
        res.status(400).json({ success: false, message: "Failed to fetch availability", error: err.message });
    }
};
exports.fetchAvailability = fetchAvailability;
const updateServiceRadius = async (req, res) => {
    const { serviceRadiusKm, latitude, longitude } = req.body;
    if (serviceRadiusKm === undefined ||
        latitude === undefined ||
        longitude === undefined) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields",
            error: "All fields are required"
        });
    }
    try {
        const updated = await (0, vendor_services_1.updateServiceRadiusAndLocation)(req.user.id, serviceRadiusKm, latitude, longitude);
        res.json({
            success: true,
            message: "Service radius and location updated",
            data: updated,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Failed to update service radius", error: err.message });
    }
};
exports.updateServiceRadius = updateServiceRadius;
const getNearbyVendors = async (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({
            success: false,
            message: "Missing coordinates",
            error: "Latitude and longitude are required"
        });
    }
    try {
        const vendors = await (0, vendor_services_1.findNearbyVendors)(parseFloat(latitude), parseFloat(longitude));
        res.json({ success: true, message: "Nearby vendors fetched", data: vendors });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch nearby vendors", error: err.message });
    }
};
exports.getNearbyVendors = getNearbyVendors;
const fetchAllServiceCategories = async (req, res) => {
    try {
        const services = await (0, vendor_services_1.getAllVendorServices)();
        res.json({ success: true, message: "Service categories fetched", data: services });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch service categories", error: err.message });
    }
};
exports.fetchAllServiceCategories = fetchAllServiceCategories;
const filterVendorsByService = async (req, res) => {
    const { service } = req.query;
    try {
        const vendors = await (0, vendor_services_1.getVendorsByService)(service);
        res.json({ success: true, message: "Vendors filtered by service", data: vendors });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Failed to filter vendors", error: err.message });
    }
};
exports.filterVendorsByService = filterVendorsByService;
