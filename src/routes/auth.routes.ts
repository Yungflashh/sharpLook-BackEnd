import { Router } from "express"
import { register, login, requestReset, reset } from "../controllers/auth.controller"
import { sendOtp, verifyOtp } from "../controllers/auth.controller"
import { registerVendor } from "../controllers/vendorOnboarding.controller"
import { upload } from "../utils/multer"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/send-otp", sendOtp)
router.post("/verify-otp", verifyOtp)
router.post("/request-password-reset", requestReset)
router.post("/reset-password", reset)
router.post("/register-vendor", upload.single("identityImage"), registerVendor)

export default router
