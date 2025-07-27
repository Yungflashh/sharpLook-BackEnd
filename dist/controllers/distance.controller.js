"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = void 0;
const distance_1 = require("../utils/distance");
const prisma_1 = __importDefault(require("../config/prisma"));
const calculateDistance = async (req, res) => {
    const { clientLat, clientLng, vendorId } = req.body;
    if (typeof clientLat !== "number" ||
        typeof clientLng !== "number" ||
        !vendorId) {
        return res.status(400).json({ error: "Invalid input data." });
    }
    try {
        const vendorDetails = await prisma_1.default.vendorOnboarding.findUnique({
            where: {
                userId: vendorId,
            },
            select: {
                latitude: true,
                longitude: true,
            },
        });
        if (!vendorDetails || vendorDetails.latitude == null || vendorDetails.longitude == null) {
            return res.status(404).json({ error: "Vendor location not found." });
        }
        const vendorLat = vendorDetails.latitude;
        const vendorLng = vendorDetails.longitude;
        const distanceKm = (0, distance_1.haversineDistanceKm)(clientLat, clientLng, vendorLat, vendorLng);
        const totalKm = Math.round(distanceKm);
        const transportPrice = totalKm * 200;
        return res.json({
            distanceKm: totalKm,
            transportPrice,
        });
    }
    catch (error) {
        console.error("Error calculating distance:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};
exports.calculateDistance = calculateDistance;
// let clientLat = 40.7128
// let clientLng =  -74.0060
// let vendorLat =  30.0444
// let vendorLng =   31.2357
// let answer = haversineDistanceKm(clientLat,clientLng, vendorLat, vendorLng )
// let whole  =Math.round(answer)
// console.log( whole * 200);
