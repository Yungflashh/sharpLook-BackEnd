import { Router } from "express";
import { requestWithdrawal,getUserWithdrawals, getAllWithdrawals,updateWithdrawalStatus } from "../controllers/withdrawal.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { requireAdminRole } from "../middlewares/admin.middleware";
import { Role } from '@prisma/client';



const router = Router();

router.post("/requestWithdrawals", verifyToken, requestWithdrawal);


router.get("/myWithdrawals", verifyToken, getUserWithdrawals);



// ADMIN: View all withdrawals
router.get("/all",  requireAdminRole(Role.ADMIN, Role.SUPERADMIN), getAllWithdrawals);

// ADMIN: Update withdrawal status
router.patch("/:id/status",  requireAdminRole(Role.ADMIN, Role.SUPERADMIN), updateWithdrawalStatus);
export default router;
