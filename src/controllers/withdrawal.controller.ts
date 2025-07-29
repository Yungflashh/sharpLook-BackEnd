import { Request, Response, NextFunction } from "express";
import {
  requestWithdrawalService,
  updateWithdrawalStatusService,
  getUserWithdrawalsService,
  getAllWithdrawalsService
} from "../services/withdrawal.service";
import { WithdrawalService ,resolveAccount} from "../services/withdrawal.service";
import { getBanks } from "../utils/paystack";
import { success } from "zod";


export const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const { amount, bankAccountNumber, bankCode, resolvedAccountName } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId || !amount || !bankAccountNumber || !bankCode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await WithdrawalService.requestWithdrawal({
      userId,
      amount,
      bankAccountNumber,
      bankCode,
      resolvedAccountName,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Withdrawal error:", error);

    let message = "Withdrawal failed";

    // Custom Paystack or service-level messages
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    return res.status(500).json({ message });
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


export const resolveAccountController = async (req: Request, res: Response) => {
  try {
    const { bankAccountNumber, bankCode } = req.body;
    if (!bankAccountNumber || !bankCode) {
      return res.status(400).json({ message: "bankAccountNumber and bankCode are required" });
    }

    const accountDetails = await resolveAccount(bankAccountNumber, bankCode);

    return res.status(200).json({
      message: "Account resolved successfully",
      data: accountDetails,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllBanks = async (req: Request, res: Response) => {

  const banksList = await getBanks()

  res.status(200).json({
    success : true,
    message : "Banks List gotten Successfully",
    data : banksList
  })
}
