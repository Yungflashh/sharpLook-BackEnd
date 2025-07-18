import { Request, Response } from "express"
import {
  getUserById,
  updateUserProfile,
  updateClientLocationPreferences,
  getTopRatedVendors,
 getVendorDetails
} from "../services/user.services"

// 🧑‍💼 Get Logged-in User Profile
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.user!.id)
    res.status(200).json({ success: true, data: user })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// 🛠️ Update Logged-in User Profile
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const updated = await updateUserProfile(req.user!.id, req.body)
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// 📍 Set Location Preferences for Nearby Vendor Filtering
export const setClientLocationPreferences = async (
  req: Request,
  res: Response
) => {
  const { latitude, longitude, radiusKm } = req.body
  const userId = req.user?.id!

  if (!latitude || !longitude || !radiusKm) {
    return res.status(400).json({
      success: false,
      message: "Missing required location fields: latitude, longitude, radiusKm",
    })
  }

  try {
    const updatedUser = await updateClientLocationPreferences(
      userId,
      latitude,
      longitude,
      radiusKm
    )
    res.status(200).json({
      success: true,
      message: "Location preferences updated successfully",
      data: updatedUser,
    })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// ⭐ Get Top Rated Vendors (optional limit query param)
export const fetchTopVendors = async (req: Request, res: Response) => {
  console.log("🔍 Received request to fetch top vendors")

  const limit = parseInt(req.query.limit as string) || 10
  console.log(`📌 Parsed limit from query: ${limit}`)

  try {
    console.log("🚀 Fetching top rated vendors...")
    const topVendors = await getTopRatedVendors(limit)
    console.log("✅ Top vendors fetched successfully")

    res.status(200).json({
      success: true,
      message: "Top vendors fetched successfully",
      data: topVendors,
    })
    console.log("📤 Response sent to client")
  } catch (err: any) {
    console.error("❌ Error occurred while fetching top vendors:", err)
    res.status(500).json({ success: false, message: err.message })
  }
}


export const getAVendorDetails = async (req: Request, res: Response) => {
  const vendorId = req.params.id

  try {
    const vendorDetails = await getVendorDetails(vendorId)

    if (!vendorDetails) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Vendor details fetched successfully",
      data: vendorDetails,
    })
  } catch (err: any) {
    console.error("❌ Failed to get vendor details:", err)
    res.status(500).json({ success: false, message: err.message })
  }
}