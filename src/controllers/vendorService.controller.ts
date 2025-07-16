import { Request, Response } from "express"
import { addVendorService, getVendorServices } from "../services/vendorService.service"
import  uploadToCloudinary  from "../utils/cloudinary"

export const createVendorService = async (req: Request, res: Response) => {
  const { serviceName, servicePrice } = req.body
  const file = req.file
  const vendorId = req.user?.id!

  if (!file || !serviceName || !servicePrice)
    return res.status(400).json({ error: "All fields are required" })

  try {
    const upload = await uploadToCloudinary(file.buffer, "vendor_services")
    const service = await addVendorService(vendorId, serviceName, parseFloat(servicePrice), upload.secure_url)
    res.status(201).json({ success: true, data: service })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const fetchVendorServices = async (req: Request, res: Response) => {
  const vendorId = req.user?.id!

  try {
    const services = await getVendorServices(vendorId)
    res.json({ success: true, data: services })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}


