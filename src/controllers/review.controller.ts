import { Request, Response } from "express"
import * as ReviewService from "../services/review.service"

export const postReview = async (req: Request, res: Response) => {
  const { bookingId, vendorId, rating, comment } = req.body
  const clientId = req.user?.id!

  if (!bookingId || !vendorId || !rating) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    const review = await ReviewService.createReview(vendorId, clientId, bookingId, rating, comment)
    res.status(201).json({ success: true, message: "Review posted", data: review })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const fetchVendorReviews = async (req: Request, res: Response) => {
  const vendorId = req.params.vendorId

  try {
    const reviews = await ReviewService.getVendorReviews(vendorId)
    res.status(200).json({ success: true, data: reviews })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
