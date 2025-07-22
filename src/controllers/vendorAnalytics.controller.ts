import { Request, Response } from "express";
import * as VendorAnalyticsService from "../services/vendorAnalytics.service";
import { getVendorEarningsGraphData } from "../services/vendorAnalytics.service";

export const fetchVendorEarningsGraph = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user?.id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Vendor ID missing",
      });
    }

    const analytics = await getVendorEarningsGraphData(vendorId);

    return res.status(200).json({
      success: true,
      message: "Graph earnings data fetched successfully",
      data: analytics,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch analytics data",
    });
  }
};





export const fetchVendorAnalytics = async (req: Request, res: Response) => {
  const vendorId = req.params.vendorId;

  try {
    const data = await VendorAnalyticsService.getVendorAnalytics(vendorId);
    return res.status(200).json({
      success: true,
      message: "Vendor analytics fetched successfully",
      data
    });
  } catch (err: any) {
    console.error("Analytics error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor analytics",
    });
  }
};
