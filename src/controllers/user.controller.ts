import { Request, Response } from "express"
import { getUserById, updateUserProfile } from "../services/user.services"

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
