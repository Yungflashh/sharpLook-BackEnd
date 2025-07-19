import { Request, Response } from "express"
import {
  getAllVendorServices,
  getVendorServicesByVendorId,
} from "../services/clientService.service"

export const fetchAllServices = async (_req: Request, res: Response) => {

  
  try {
    const services = await getAllVendorServices();
    return res.status(200).json({
      success: true,
      message: "All vendor services fetched successfully",
      data: services
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const fetchVendorServices = async (req: Request, res: Response) => {
  const { vendorId } = req.params;

  try {
    const services = await getVendorServicesByVendorId(vendorId);
    return res.status(200).json({
      success: true,
      message: `Services for vendor ${vendorId} fetched successfully`,
      data: services
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
