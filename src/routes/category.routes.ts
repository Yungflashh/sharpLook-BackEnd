import express from "express";
import {
  handleCreateServiceCategory,
  handleGetServiceCategories,
} from "../controllers/category.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { requireAdminRole } from "../middlewares/admin.middleware";
import { Role } from '@prisma/client';

const router = express.Router();

router.post("/addAService", verifyToken, requireAdminRole(Role.ADMIN, Role.SUPERADMIN), handleCreateServiceCategory);
router.get("/getAllServices", verifyToken, handleGetServiceCategories);

export default router;
