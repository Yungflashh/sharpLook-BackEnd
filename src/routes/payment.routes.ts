import express from "express";
import {
  createPaystackPayment,
  verifyPaystackPayment,
} from "../controllers/payment.controlelr";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/paystack/initiate", verifyToken, createPaystackPayment);
router.get("/paystack/verify/:reference", verifyToken, verifyPaystackPayment);

export default router;
