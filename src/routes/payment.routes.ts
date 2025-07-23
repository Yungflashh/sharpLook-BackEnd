import express from "express";
import {
  createPaystackPayment,
  verifyPaystackPayment,
} from "../controllers/payment.controlelr";

const router = express.Router();

router.post("/paystack/initiate", createPaystackPayment);
router.get("/paystack/verify/:reference", verifyPaystackPayment);

export default router;
