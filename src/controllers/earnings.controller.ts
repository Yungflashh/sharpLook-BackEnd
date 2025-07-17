import { Request, Response } from "express";
import { calculateEarnings } from "../services/earnings.service";

export const getVendorEarnings = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user!.id;
    const earnings = await calculateEarnings(vendorId);

    return res.status(200).json({
      success: true,
      message: "Vendor earnings fetched successfully",
      data: earnings
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
