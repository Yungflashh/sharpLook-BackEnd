import { Request, Response, NextFunction } from "express"
import * as ReviewService from "../services/review.service"


// review.controller.ts
// export const postReview = async (req: Request, res: Response) => {
//   const { bookingId, productId, serviceId, vendorId, rating, comment, type } = req.body;
//   const clientId = req.user?.id!;

//   // Validate required fields
//   if (!vendorId || !clientId || !rating || !type) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing required fields: vendorId, clientId, rating, or type",
//     });
//   }

//   // Enforce type-specific ID requirement
//   const missingContext =
//     (type === 'BOOKING' && !bookingId) ||
//     (type === 'PRODUCT' && !productId) ||
//     (type === 'SERVICE' && !serviceId) ||
//     (type === 'VENDOR' && (bookingId || productId || serviceId)); // VENDOR should have no others

//   if (missingContext) {
//     return res.status(400).json({
//       success: false,
//       message: `Missing or invalid ID for review type "${type}"`,
//     });
//   }

//   try {
//     const review = await ReviewService.createReview({
//       vendorId,
//       clientId,
//       rating,
//       comment,
//       bookingId,
//       productId,
//       serviceId,
//       type,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Review posted successfully",
//       data: review,
//     });
//   } catch (err: any) {
//     console.error("🔥 Review error:", err);

//     if (err.code === 'P2002') {
//       const target = err.meta?.target?.toString() ?? "";

//       if (target.includes("bookingId")) {
//         return res.status(400).json({
//           success: false,
//           message: "You have already submitted a review for this booking.",
//         });
//       }

//       if (target.includes("productId")) {
//         return res.status(400).json({
//           success: false,
//           message: "You have already submitted a review for this product.",
//         });
//       }

//       if (target.includes("serviceId")) {
//         return res.status(400).json({
//           success: false,
//           message: "You have already submitted a review for this service.",
//         });
//       }

//       return res.status(400).json({
//         success: false,
//         message: "You have already submitted a review.",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to post review",
//       error: err.message,
//     });
//   }
// };

export const postBookingReview = async (req: Request, res: Response) => {
  const { bookingId, vendorId, rating, comment } = req.body;
  const clientId = req.user?.id!;

  if (!bookingId || !vendorId || !rating) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields for booking review",
    });
  }

  try {
    const review = await ReviewService.createReview({
      type: "BOOKING",
      bookingId,
      vendorId,
      clientId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Booking review posted successfully",
      data: review,
    });
  } catch (err: any) {
    console.error("Booking review error:", err);
    // Handle P2002 unique constraint errors and others as before
    if (err.code === "P2002" && err.meta?.target?.includes("bookingId")) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this booking.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to post booking review",
      error: err.message,
    });
  }
};


export const postProductReview = async (req: Request, res: Response) => {
  const { productId, vendorId, rating, comment, clientId } = req.body;
  // const clientId = req.user?.id!;

  if (!productId || !vendorId || !rating) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields for product review",
    });
  }


  console.log("This is clien t ID,", clientId);
  
  try {
    const review = await ReviewService.createReview({
     
      vendorId,
      clientId,
      rating,
      comment,
       type: "PRODUCT",
      productId,

      
    });

    return res.status(201).json({
      success: true,
      message: "Product review posted successfully",
      data: review,
    });
  } catch (err: any) {
    console.error("Product review error:", err);
    if (err.code === "P2002" && err.meta?.target?.includes("productId")) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this product.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to post product review",
      error: err.message,
    });
  }
};



export const postServiceReview = async (req: Request, res: Response) => {
  const { serviceId, vendorId, rating, comment } = req.body;
  const clientId = req.user?.id!;

  if (!serviceId || !vendorId || !rating) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields for service review",
    });
  }

  try {
    const review = await ReviewService.createReview({
      type: "SERVICE",
      serviceId,
      vendorId,
      clientId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Service review posted successfully",
      data: review,
    });
  } catch (err: any) {
    console.error("Service review error:", err);
    if (err.code === "P2002" && err.meta?.target?.includes("serviceId")) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this service.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to post service review",
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
    const { vendorId, serviceId } = req.params;

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
    const { vendorId, productId } = req.params;

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
