import { Request, Response } from "express"
import { updateVendorProfile } from "../services/vendorOnboarding.service"
import { addPortfolioImages, getPortfolioImages, getVendorSpecialties, updateVendorSpecialties,setVendorAvailability, getVendorAvailability } from "../services/vendor.services"
import uploadToCloudinary from "../utils/cloudinary"


export const completeVendorProfile = async (req: Request, res: Response) => {
  try {
    const updated = await updateVendorProfile(req.user!.id, req.body)
    res.json({ success: true, message: "Profile updated", data: updated })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const uploadPortfolioImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" })
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
    console.error(err)
    res.status(500).json({ error: "Failed to upload portfolio images" })
  }
}

export const fetchPortfolioImages = async (req: Request, res: Response) => {
  try {
    const portfolio = await getPortfolioImages(req.user!.id)
    res.json({ success: true, data: portfolio })
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch portfolio images" })
  }
}


export const setVendorSpecialties = async (req: Request, res: Response) => {
  try {
    const { specialties } = req.body
    if (!Array.isArray(specialties)) {
      return res.status(400).json({ error: "Specialties must be an array of strings" })
    }

    const updated = await updateVendorSpecialties(req.user!.id, specialties)
    res.json({ success: true, message: "Specialties updated", data: updated })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const fetchVendorSpecialties = async (req: Request, res: Response) => {
  try {
    const data = await getVendorSpecialties(req.user!.id)
    res.json({ success: true, data })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}



export const updateAvailability = async (req: Request, res: Response) => {
  const { days, fromTime, toTime } = req.body

  try {
    const availability = await setVendorAvailability(req.user!.id, days, fromTime, toTime)
    res.json({ success: true, message: "Availability updated", data: availability })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const fetchAvailability = async (req: Request, res: Response) => {
  try {
    const availability = await getVendorAvailability(req.user!.id)
    res.json({ success: true, data: availability })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}


