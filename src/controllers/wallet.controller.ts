import { Request, Response } from "express"
import { getUserWallet, getWalletTransactions} from "../services/wallet.service"
import { handlePaystackWebhook , initiatePaystackPayment } from "../services/payment.service"
// import { initializePayment  } from "../utils/paystack"

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
  const userId = req.user!.id
  try {
    const { email, amount } = req.body

    const paymentFor = "WALLET FUNDING"
    console.log(typeof amount);
    
    const payment = await initiatePaystackPayment(userId,amount,paymentFor )

    console.log(payment);
    
    res.status(200).json({ message: "Initialized", data: payment })
  } catch (error: unknown) {
    const err = error as Error
    res.status(400).json({ error: err.message })
  }
}

export const verifyWalletFunding = async (req: Request, res: Response) => {
  try {
    const { reference } = req.body
    console.log("[verifyWalletFunding] Incoming request - Body:", req.body)

    if (!reference || typeof reference !== "string") {
      const message = "Missing or invalid reference"
      console.error("[verifyWalletFunding] Error:", message)
      return res.status(400).json({ error: message })
    }

    const result = await handlePaystackWebhook(reference)


    if (result.success == false){
     return res.status(400).json({
        success : false,
        message: result.message
      })
    }


    else {
       res.status(200).json({ message: result })
    }
   
  } catch (error: unknown) {
    const err = error as Error
    console.error("[verifyWalletFunding] Error occurred:", err.message)

    // Add more structured error details for debugging
    res.status(400).json({
      error: "Funding failed",
      details: err.message,
      message: "verifyWalletFunding",
    })
  }
}