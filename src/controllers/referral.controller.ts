import { Request, Response } from "express";
import { getUserReferrals } from "../services/referral.service";

export const getReferralHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const referrals = await getUserReferrals(userId);

    return res.status(200).json({
      success: true,
      message: "Referral history fetched successfully",
      data: referrals,
    });
  } catch (error: any) {
    console.error("Error fetching referral history:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching referral history",
    });
  }
};
