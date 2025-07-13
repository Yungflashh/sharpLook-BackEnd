// src/controllers/vendorPricing.controller.ts
import { Request, Response } from "express"
import { updateVendorPricing, getVendorPricing } from "../services/vendorPricing.service"

export const setVendorPricing = async (req: Request, res: Response) => {
  try {
    const pricing = req.body.pricing
    if (!pricing) return res.status(400).json({ error: "Pricing data is required" })

    const updated = await updateVendorPricing(req.user!.id, pricing)
    res.json({ success: true, message: "Pricing updated", data: updated })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const fetchVendorPricing = async (req: Request, res: Response) => {
  try {
    const pricing = await getVendorPricing(req.user!.id)
    res.json({ success: true, data: pricing })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
