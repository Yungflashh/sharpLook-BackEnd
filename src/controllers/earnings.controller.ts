import { Request, Response } from "express"
import { calculateEarnings } from "../services/earnings.service"

export const getVendorEarnings = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user!.id
    const earnings = await calculateEarnings(vendorId)
    res.json({ success: true, data: earnings })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
