import express from "express";
import {
  handleCreateServiceCategory,
  handleGetServiceCategories,
} from "../controllers/category.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { isAuthorized } from "../middlewares/isAuthorized";
import { Role } from '@prisma/client';

const router = express.Router();

router.post("/addAService", verifyToken, isAuthorized(Role.ADMIN, Role.SUPERADMIN), handleCreateServiceCategory);
router.get("/getAllServices", verifyToken, handleGetServiceCategories);

export default router;
