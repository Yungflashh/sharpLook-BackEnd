import { Request, Response } from "express"
import { updateVendorProfile } from "../services/vendorOnboarding.service"
import {
  addPortfolioImages,
  getPortfolioImages,
  setVendorAvailability,
  getVendorAvailability,
  updateServiceRadiusAndLocation,
  findNearbyVendors,
  getAllVendorServices,
  getVendorsByService
} from "../services/vendor.services"
import uploadToCloudinary from "../utils/cloudinary"
import prisma from "../config/prisma"
export const completeVendorProfile = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user!.id;
    const updated = await updateVendorProfile(vendorId, req.body);

    res.json({
      success: true,
      message: "Vendor profile completed successfully",
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: "Failed to complete vendor profile",
      error: err.message,
    });
  }
};

export const uploadPortfolioImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded", error: "No images provided" })
    }

    const uploadResults = await Promise.all(
      req.files.map((file: Express.Multer.File) =>
        uploadToCloudinary(file.buffer, file.mimetype)
      )
    )

    const urls = uploadResults.map(result => result.secure_url)
    const updated = await addPortfolioImages(req.user!.id, urls)

    res.json({ success: true, message: "Portfolio images uploaded", data: updated })
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to upload portfolio images", error: err.message })
  }
}

export const fetchPortfolioImages = async (req: Request, res: Response) => {
  try {
    const portfolio = await getPortfolioImages(req.user!.id)
    res.json({ success: true, message: "Fetched portfolio images", data: portfolio })
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch portfolio images", error: err.message })
  }
}

export const updateAvailability = async (req: Request, res: Response) => {
  const { days, fromTime, toTime } = req.body

  try {
    const availability = await setVendorAvailability(req.user!.id, days, fromTime, toTime)
    res.json({ success: true, message: "Availability updated", data: availability })
  } catch (err: any) {
    res.status(400).json({ success: false, message: "Failed to update availability", error: err.message })
  }
}

export const fetchAvailability = async (req: Request, res: Response) => {
  try {
    const availability = await getVendorAvailability(req.user!.id)
    res.json({ success: true, message: "Fetched availability", data: availability })
  } catch (err: any) {
    res.status(400).json({ success: false, message: "Failed to fetch availability", error: err.message })
  }
}

export const updateServiceRadius = async (req: Request, res: Response) => {
  const { serviceRadiusKm, latitude, longitude } = req.body

  if (
    serviceRadiusKm === undefined ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
      error: "All fields are required"
    })
  }

  try {
    const updated = await updateServiceRadiusAndLocation(
      req.user!.id,
      serviceRadiusKm,
      latitude,
      longitude
    )

    res.json({
      success: true,
      message: "Service radius and location updated",
      data: updated,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to update service radius", error: err.message })
  }
}

export const getNearbyVendors = async (req: Request, res: Response) => {
  const { latitude, longitude } = req.query

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "Missing coordinates",
      error: "Latitude and longitude are required"
    })
  }

  try {
    const vendors = await findNearbyVendors(
      parseFloat(latitude as string),
      parseFloat(longitude as string)
    )

    res.json({ success: true, message: "Nearby vendors fetched", data: vendors })
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch nearby vendors", error: err.message })
  }
}

export const fetchAllServiceCategories = async (req: Request, res: Response) => {
  try {
    const services = await getAllVendorServices()
    res.json({ success: true, message: "Service categories fetched", data: services })
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch service categories", error: err.message })
  }
}

export const filterVendorsByService = async (req: Request, res: Response) => {
  const { service } = req.query

  try {
    const vendors = await getVendorsByService(service as string | undefined)
    res.json({ success: true, message: "Vendors filtered by service", data: vendors })
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to filter vendors", error: err.message })
  }
}




export const editVendorProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      availability,
      bio,
      businessName,
      location,
      phoneNumber,
      registerationNumber,
    } = req.body;

    let uploadedPortfolioUrls: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      // req.files is array of uploaded portfolio images
      const files = req.files as Express.Multer.File[];

      const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, file.mimetype));
      const uploadResults = await Promise.all(uploadPromises);

      uploadedPortfolioUrls = uploadResults.map(result => result.secure_url);
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: phoneNumber,
      },
    });

    // Update VendorOnboarding
    const updatedVendorOnboarding = await prisma.vendorOnboarding.update({
      where: { userId },
      data: {
        bio,
        businessName,
        location,
        registerationNumber,
        // Only update portfolioImages if we have new uploaded images
        portfolioImages: uploadedPortfolioUrls.length > 0 ? uploadedPortfolioUrls : undefined,
      },
    });

    // Update/Create Availability
    let updatedAvailability = null;
    if (availability) {
      updatedAvailability = await prisma.vendorAvailability.upsert({
        where: { vendorId: userId },
        update: {
          days: availability.days,
          fromTime: availability.fromTime,
          toTime: availability.toTime,
        },
        create: {
          vendorId: userId,
          days: availability.days,
          fromTime: availability.fromTime,
          toTime: availability.toTime,
        },
      });
    }

    return res.status(200).json({
      message: "Vendor profile updated successfully",
      data: {
        user: updatedUser,
        onboarding: updatedVendorOnboarding,
        availability: updatedAvailability,
      },
    });
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    return res.status(500).json({ error: "Failed to update vendor profile" });
  }
};

