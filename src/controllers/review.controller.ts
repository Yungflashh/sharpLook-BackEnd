import { Request, Response, NextFunction } from "express"
import * as ReviewService from "../services/review.service"


// review.controller.ts
export const postReview = async (req: Request, res: Response) => {
  const { bookingId, productId, serviceId, vendorId, rating, comment, type } = req.body;
  const clientId = req.user?.id!;

  // Validate required fields
  if (!vendorId || !clientId || !rating || !type) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: vendorId, clientId, rating, or type",
    });
  }

  // Enforce type-specific ID requirement
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
    console.error("🔥 Review error:", err);

    if (err.code === 'P2002') {
      const target = err.meta?.target?.toString() ?? "";

      if (target.includes("bookingId")) {
        return res.status(400).json({
          success: false,
          message: "You have already submitted a review for this booking.",
        });
      }

      if (target.includes("productId")) {
        return res.status(400).json({
          success: false,
          message: "You have already submitted a review for this product.",
        });
      }

      if (target.includes("serviceId")) {
        return res.status(400).json({
          success: false,
          message: "You have already submitted a review for this service.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "You have already submitted a review.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to post review",
      error: err.message,
    });
  }
};






export const fetchVendorReviews = async (req: Request, res: Response) => {
  const {vendorId, type} = req.body;
  // const type = req.query.type as 'BOOKING' | 'PRODUCT' | 'SERVICE' | 'VENDOR' | undefined;

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


export const handleGetServiceReviewsByVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { vendorId, serviceId } = req.body;

    const reviews = await ReviewService.getServiceReviewsByVendor(vendorId, serviceId);
    return res.status(200).json({
      success: true,
      message: "Service reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};


export const handleGetProductReviewsByVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { vendorId, productId } = req.body;

    const reviews = await ReviewService.getProductReviewsByVendor(vendorId, productId);
    return res.status(200).json({
      success: true,
      message: "Product reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
