import { Request, Response } from "express"
import { getUserReferrals } from "../services/referral.service"

export const getReferralHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const referrals = await getUserReferrals(userId);

    res.status(200).json(referrals);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "An error occured" });
  }
};
