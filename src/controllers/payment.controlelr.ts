import { Request, Response } from "express";
import {
  initiatePaystackPayment,
  confirmPaystackPayment,
} from "../services/payment.service";

export const createPaystackPayment = async (req: Request, res: Response) => {
  try {
    const { userId, amount, paymentFor, metadata, description } = req.body;

    const payment = await initiatePaystackPayment(
      userId,
      amount,
      paymentFor,
      description
    );

    return res.status(200).json({
      success: true,
      paymentUrl: payment.authorization_url,
      reference: payment.reference,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Payment error" });
  }
};

export const verifyPaystackPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const transaction = await confirmPaystackPayment(reference);

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Verification error" });
  }
};
