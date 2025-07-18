import { Request, Response } from "express"
import { getUserWallet, getWalletTransactions} from "../services/wallet.service"
import { handlePaystackWebhook  } from "../services/payment.service"
import { initializePayment  } from "../utils/paystack"

export const getWalletDetails = async (req: Request, res: Response) => {
  try {
    // 1. Extract user ID
    const userId = req.user!.id;

    // 2. Fetch wallet by user ID
    const wallet = await getUserWallet(userId);

    // 3. Handle wallet not found
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // 4. Return wallet info
    return res.status(200).json({ success: true, wallet });
  } catch (error) {
    // 5. Handle unexpected error
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const walletTransactions = async (req: Request, res: Response) => {
  try {
    // 1. Extract user ID
    const userId = req.user!.id;

    // 2. Fetch transactions from DB
    const transactions = await getWalletTransactions(userId);

    // 3. Return transaction list
    res.status(200).json(transactions);
  } catch (error) {
    // 4. Handle unexpected error
    console.log(error);
    res.status(500).json({ message: "An Error occurred" });
  }
};


export const fundWallet = async (req: Request, res: Response) => {
  try {
    const { email, amount } = req.body
    const payment = await initializePayment(email, amount)
    res.status(200).json({ message: "Initialized", data: payment.data })
  } catch (error: unknown) {
    const err = error as Error
    res.status(400).json({ error: err.message })
  }
}

export const verifyWalletFunding = async (req: Request, res: Response) => {
  try {
    const { reference } = req.body
    if (!reference || typeof reference !== "string") {
      return res.status(400).json({ error: "Missing or invalid reference" })
    }

    const result = await handlePaystackWebhook(reference)
    res.status(200).json({ message: result })
  } catch (error: unknown) {
    const err = error as Error
    res.status(400).json({ error: err.message })
  }
}