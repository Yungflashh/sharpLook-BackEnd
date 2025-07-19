"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAVendorDetails = exports.fetchTopVendors = exports.setClientLocationPreferences = exports.updateMyProfile = exports.getMyProfile = void 0;
const user_services_1 = require("../services/user.services");
// 🧑‍💼 Get Logged-in User Profile
const getMyProfile = async (req, res) => {
    try {
        const user = await (0, user_services_1.getUserById)(req.user.id);
        res.status(200).json({ success: true, data: user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMyProfile = getMyProfile;
// 🛠️ Update Logged-in User Profile
const updateMyProfile = async (req, res) => {
    try {
        const updated = await (0, user_services_1.updateUserProfile)(req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updated,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateMyProfile = updateMyProfile;
// 📍 Set Location Preferences for Nearby Vendor Filtering
const setClientLocationPreferences = async (req, res) => {
    const { latitude, longitude, radiusKm } = req.body;
    const userId = req.user?.id;
    if (!latitude || !longitude || !radiusKm) {
        return res.status(400).json({
            success: false,
            message: "Missing required location fields: latitude, longitude, radiusKm",
        });
    }
    try {
        const updatedUser = await (0, user_services_1.updateClientLocationPreferences)(userId, latitude, longitude, radiusKm);
        res.status(200).json({
            success: true,
            message: "Location preferences updated successfully",
            data: updatedUser,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
exports.setClientLocationPreferences = setClientLocationPreferences;
// ⭐ Get Top Rated Vendors (optional limit query param)
const fetchTopVendors = async (req, res) => {
    console.log("🔍 Received request to fetch top vendors");
    const limit = parseInt(req.query.limit) || 10;
    console.log(`📌 Parsed limit from query: ${limit}`);
    try {
        console.log("🚀 Fetching top rated vendors...");
        const topVendors = await (0, user_services_1.getTopRatedVendors)(limit);
        console.log("✅ Top vendors fetched successfully");
        res.status(200).json({
            success: true,
            message: "Top vendors fetched successfully",
            data: topVendors,
        });
        console.log("📤 Response sent to client");
    }
    catch (err) {
        console.error("❌ Error occurred while fetching top vendors:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.fetchTopVendors = fetchTopVendors;
const getAVendorDetails = async (req, res) => {
    const { vendorId } = req.params;
    if (!vendorId) {
        return res.status(400).json({
            success: false,
            message: "Missing vendorId in request parameters"
        });
    }
    try {
        const vendorDetails = await (0, user_services_1.getVendorDetails)(vendorId);
        if (!vendorDetails) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Vendor details fetched successfully",
            data: vendorDetails,
        });
    }
    catch (err) {
        console.error("❌ Failed to get vendor details:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAVendorDetails = getAVendorDetails;
