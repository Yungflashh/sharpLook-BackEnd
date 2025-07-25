import { Request, Response, NextFunction } from "express";
import {
  requestWithdrawalService,
  updateWithdrawalStatusService,
  getUserWithdrawalsService,
  getAllWithdrawalsService
} from "../services/withdrawal.service";

export const requestWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, reason, method, metadata } = req.body;
    const userId = req.user!.id;

    const withdrawal = await requestWithdrawalService(userId, amount, reason, method, metadata);
    res.status(201).json({ success: true, message: "Withdrawal request submitted", data: withdrawal });
  } catch (err) {
    next(err);
  }
};

export const updateWithdrawalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await updateWithdrawalStatusService(id, status);
    res.status(200).json({ success: true, message: `Withdrawal ${status.toLowerCase()}`, data: updated });
  } catch (err) {
    next(err);
  }
};

export const getUserWithdrawals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const withdrawals = await getUserWithdrawalsService(req.user!.id);
    res.status(200).json({ success: true, data: withdrawals });
  } catch (err) {
    next(err);
  }
};

export const getAllWithdrawals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const all = await getAllWithdrawalsService();
    res.status(200).json({ success: true, data: all });
  } catch (err) {
    next(err);
  }
};
