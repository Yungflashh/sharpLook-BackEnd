
import { haversineDistanceKm } from "../utils/distance";
import { Request, Response } from "express";




export const calculateDistance =  (req: Request, res: Response) => {
  const { clientLat, clientLng, vendorLat, vendorLng } = req.body;

  if (
    typeof clientLat !== "number" ||
    typeof clientLng !== "number" ||
    typeof vendorLat !== "number" ||
    typeof vendorLng !== "number"
  ) {
    return res.status(400).json({ error: "Invalid coordinates provided." });
  }

  const distanceKm = haversineDistanceKm(clientLat, clientLng, vendorLat, vendorLng);
  // const homeServicePrice = calculateHomeServicePrice(distanceKm);

  return res.json({
    distanceKm: Number(distanceKm.toFixed(2)),
   
  });
};