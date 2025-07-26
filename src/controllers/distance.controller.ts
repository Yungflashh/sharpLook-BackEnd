
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
  const totalKm = Math.round(distanceKm)
  const tranportPrice = totalKm * 200;

  console.log(tranportPrice);
  
  return res.json({
    transportPrice: Number(tranportPrice),
   
  });
};


// let clientLat = 40.7128

// let clientLng =  -74.0060
// let vendorLat =  30.0444


// let vendorLng =   31.2357

// let answer = haversineDistanceKm(clientLat,clientLng, vendorLat, vendorLng )
// let whole  =Math.round(answer)
// console.log( whole * 200);
