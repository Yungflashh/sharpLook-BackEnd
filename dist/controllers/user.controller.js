"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTopVendors = exports.setClientLocationPreferences = exports.updateMyProfile = exports.getMyProfile = void 0;
const user_services_1 = require("../services/user.services");
const getMyProfile = async (req, res) => {
    try {
        const user = await (0, user_services_1.getUserById)(req.user.id);
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res) => {
    try {
        const updated = await (0, user_services_1.updateUserProfile)(req.user.id, req.body);
        res.json({ message: "Profile updated", user: updated });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateMyProfile = updateMyProfile;
const setClientLocationPreferences = async (req, res) => {
    const { latitude, longitude, radiusKm } = req.body;
    const userId = req.user?.id;
    if (!latitude || !longitude || !radiusKm) {
        return res.status(400).json({ error: "Missing location or radius" });
    }
    try {
        const updatedUser = await (0, user_services_1.updateClientLocationPreferences)(userId, latitude, longitude, radiusKm);
        res.status(200).json({ success: true, data: updatedUser });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.setClientLocationPreferences = setClientLocationPreferences;
const fetchTopVendors = async (req, res) => {
    console.log("🔍 Received request to fetch top vendors");
    const limit = parseInt(req.query.limit) || 10;
    console.log(`📌 Parsed limit from query: ${limit}`);
    try {
        console.log("🚀 Fetching top rated vendors...");
        const topVendors = await (0, user_services_1.getTopRatedVendors)(limit);
        console.log("✅ Top vendors fetched successfully");
        res.json({ success: true, data: topVendors });
        console.log("📤 Response sent to client");
    }
    catch (err) {
        console.error("❌ Error occurred while fetching top vendors:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.fetchTopVendors = fetchTopVendors;
