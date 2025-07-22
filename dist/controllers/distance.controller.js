"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = void 0;
const distance_1 = require("../utils/distance");
const calculateDistance = (req, res) => {
    const { clientLat, clientLng, vendorLat, vendorLng } = req.body;
    if (typeof clientLat !== "number" ||
        typeof clientLng !== "number" ||
        typeof vendorLat !== "number" ||
        typeof vendorLng !== "number") {
        return res.status(400).json({ error: "Invalid coordinates provided." });
    }
    const distanceKm = (0, distance_1.haversineDistanceKm)(clientLat, clientLng, vendorLat, vendorLng);
    // const homeServicePrice = calculateHomeServicePrice(distanceKm);
    return res.json({
        distanceKm: Number(distanceKm.toFixed(2)),
    });
};
exports.calculateDistance = calculateDistance;
