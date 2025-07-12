import { Router } from "express"
import { getMyProfile, updateMyProfile } from "../controllers/user.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = Router()

router.get("/me", verifyToken, getMyProfile)
router.put("/me", verifyToken, updateMyProfile)

export default router
