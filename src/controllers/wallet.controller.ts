import { Request, Response } from "express"
import { getUserWallet, getWalletTransactions } from "../services/wallet.service"

export const getWalletDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const wallet = await getUserWallet(userId)

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" })
    }

    return res.status(200).json({ success: true, wallet })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: "Server Error" })
  }
}


export const walletTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const transactions = await getWalletTransactions(userId);

    res.status(200).json(transactions);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message : "An Error occured" });
  }
};