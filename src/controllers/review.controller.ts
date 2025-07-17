import { Request, Response } from "express"
import * as ReviewService from "../services/review.service"

export const postReview = async (req: Request, res: Response) => {
  const { bookingId, vendorId, rating, comment } = req.body
  const clientId = req.user?.id!

  if (!bookingId || !vendorId || !rating) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: bookingId, vendorId, or rating",
    })
  }

  try {
    const review = await ReviewService.createReview(
      vendorId,
      clientId,
      bookingId,
      rating,
      comment
    )

    return res.status(201).json({
      success: true,
      message: "Review posted successfully",
      data: review,
    })
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to post review",
    })
  }
}

export const fetchVendorReviews = async (req: Request, res: Response) => {
  const vendorId = req.params.vendorId

  try {
    const reviews = await ReviewService.getVendorReviews(vendorId)

    return res.status(200).json({
      success: true,
      message: "Vendor reviews fetched successfully",
      data: reviews,
    })
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to fetch vendor reviews",
    })
  }
}
