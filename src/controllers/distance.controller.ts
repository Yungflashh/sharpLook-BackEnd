
import { haversineDistanceKm } from "../utils/distance";
import { Request, Response } from "express";
import prisma from "../config/prisma";






export const calculateDistance = async (req: Request, res: Response) => {
  const { clientLat, clientLng, vendorIds } = req.body;

  if (
    typeof clientLat !== "number" ||
    typeof clientLng !== "number" ||
    (!vendorIds || (typeof vendorIds !== "string" && !Array.isArray(vendorIds)))
  ) {
    return res.status(400).json({ error: "Invalid input data." });
  }

  try {
    // Normalize vendorIds into an array
    const vendorIdArray = Array.isArray(vendorIds) ? vendorIds : [vendorIds];

    // Fetch vendor coordinates
    const vendors = await prisma.vendorOnboarding.findMany({
      where: {
        userId: {
          in: vendorIdArray,
        },
      },
      select: {
        userId: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!vendors.length) {
      return res.status(404).json({ error: "No valid vendors found." });
    }

    const results = [];
    let totalKm = 0;

    for (const vendor of vendors) {
      if (vendor.latitude != null && vendor.longitude != null) {
        const distance = haversineDistanceKm(clientLat, clientLng, vendor.latitude, vendor.longitude);
        const roundedKm = Math.round(distance);
        const transportPrice = roundedKm * 200;

        totalKm += roundedKm;

        results.push({
          vendorId: vendor.userId,
          distanceKm: roundedKm,
          transportPrice,
        });
      }
    }

    return res.status(200).json({
      totalVendors: results.length,
      totalKm,
      totalTransportCost: totalKm * 200,
      breakdown: results,
    });
  } catch (error) {
    console.error("Error calculating distances:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};



// let clientLat = 40.7128

// let clientLng =  -74.0060
// let vendorLat =  30.0444


// let vendorLng =   31.2357

// let answer = haversineDistanceKm(clientLat,clientLng, vendorLat, vendorLng )
// let whole  =Math.round(answer)
// console.log( whole * 200);
