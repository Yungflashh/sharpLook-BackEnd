import { Request, Response } from "express"
import * as ReviewService from "../services/review.service"

export const postReview = async (req: Request, res: Response) => {
  const { bookingId, productId, serviceId, vendorId, rating, comment, type } = req.body;
  const clientId = req.user?.id!;

  // ✅ Validate required fields
  if (!vendorId || !clientId || !rating || !type) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: vendorId, clientId, rating, or type",
    });
  }

  // ✅ Enforce type-specific ID requirement
  const missingContext =
    (type === 'BOOKING' && !bookingId) ||
    (type === 'PRODUCT' && !productId) ||
    (type === 'SERVICE' && !serviceId) ||
    (type === 'VENDOR' && (bookingId || productId || serviceId)); // VENDOR should have no others

  if (missingContext) {
    return res.status(400).json({
      success: false,
      message: `Missing or invalid ID for review type "${type}"`,
    });
  }

  try {
    const review = await ReviewService.createReview({
      vendorId,
      clientId,
      rating,
      comment,
      bookingId,
      productId,
      serviceId,
      type,
    });

    return res.status(201).json({
      success: true,
      message: "Review posted successfully",
      data: review,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to post review",
    });
  }
};

export const fetchVendorReviews = async (req: Request, res: Response) => {
  const {vendorId} = req.params;
  const type = req.query.type as 'BOOKING' | 'PRODUCT' | 'SERVICE' | 'VENDOR' | undefined;

  try {
    const reviews = await ReviewService.getVendorReviews(vendorId, type);

    return res.status(200).json({
      success: true,
      message: "Vendor reviews fetched successfully",
      data: reviews,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to fetch vendor reviews",
    });
  }
};
