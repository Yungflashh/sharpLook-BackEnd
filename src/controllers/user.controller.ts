import { Request, Response } from "express"
import { getUserById, updateUserProfile,updateClientLocationPreferences, getTopRatedVendors} from "../services/user.services"



export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.user!.id)
    res.json(user)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const updated = await updateUserProfile(req.user!.id, req.body)
    res.json({ message: "Profile updated", user: updated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}




export const setClientLocationPreferences = async (req: Request, res: Response) => {
  const { latitude, longitude, radiusKm } = req.body
  const userId = req.user?.id!

  if (!latitude || !longitude || !radiusKm) {
    return res.status(400).json({ error: "Missing location or radius" })
  }

  try {
    const updatedUser = await updateClientLocationPreferences(userId, latitude, longitude, radiusKm)
    res.status(200).json({ success: true, data: updatedUser })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const fetchTopVendors = async (req: Request, res: Response) => {
  console.log("🔍 Received request to fetch top vendors");

  const limit = parseInt(req.query.limit as string) || 10;
  console.log(`📌 Parsed limit from query: ${limit}`);

  try {
    console.log("🚀 Fetching top rated vendors...");
    const topVendors = await getTopRatedVendors(limit);
    console.log("✅ Top vendors fetched successfully");

    res.json({ success: true, data: topVendors });
    console.log("📤 Response sent to client");
  } catch (err: any) {
    console.error("❌ Error occurred while fetching top vendors:", err);
    res.status(500).json({ error: err.message });
  }
};
