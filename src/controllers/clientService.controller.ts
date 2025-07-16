import { Request, Response } from "express"
import {
  getAllVendorServices,
  getVendorServicesByVendorId,
} from "../services/clientService.service"

export const fetchAllServices = async (_req: Request, res: Response) => {
  try {
    const services = await getAllVendorServices()
    res.json({ success: true, data: services })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const fetchVendorServices = async (req: Request, res: Response) => {
  const { vendorId } = req.params

  try {
    const services = await getVendorServicesByVendorId(vendorId)
    res.json({ success: true, data: services })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
