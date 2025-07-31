import axios from "axios";
import { v4 as uuidv4 } from "uuid";


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export const initializePayment = async (email: string, amount: number) => {
     
 
  console.log(typeof amount);
  
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        callback_url: "sharplookapp://BookAppointmentScreen/:id", 
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data; // contains `authorization_url`, `access_code`, etc.
  } catch (error: any) {
    console.error("Payment initialization failed:", error.response?.data || error.message);
    throw new Error("Failed to initialize payment");
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    console.log("data got here oo");

    console.log("THis is response=> ",response.data
    );
    
    
    return response.data.data;


  } catch (error: any) {
    console.error("Payment verification failed:", error.response?.data || error.message);
    throw new Error("Failed to verify payment");
  }
};



export const generateReference = () => `REF-${uuidv4()}`;

const PAYSTACK_BASE = "https://api.paystack.co";

/**
 * ✅ Get List of Banks (for user selection)
 */
export const getBanks = async () => {
  const response = await axios.get(`${PAYSTACK_BASE}/bank?country=nigeria`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  });

  return response.data.data; // Array of { name, code, slug }
};

/**
 * ✅ Resolve a Bank Account
 */
// export const resolveAccount = async (accountNumber: string, bankCode: string) => {
//   const response = await axios.get(`${PAYSTACK_BASE}/bank/resolve`, {
//     headers: {
//       Authorization: `Bearer ${PAYSTACK_SECRET}`,
//     },
//     params: {
//       account_number: accountNumber,
//       bank_code: bankCode,
//     },
//   });

//   return response.data.data; // { account_name, account_number, bank_id }
// };

/**
 * ✅ Create a Transfer Recipient
 */
export const createTransferRecipient = async (
  name: string,
  accountNumber: string,
  bankCode: string
) => {
  const response = await axios.post(
    `${PAYSTACK_BASE}/transferrecipient`,
    {
      type: "nuban",
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    }
  );

  return response.data.data.recipient_code;
};

/**
 * ✅ Trigger Auto Withdrawal (Transfer)
 */
export const sendTransfer = async (
  amount: number,
  recipientCode: string,
  reason: string,
  metadata: any = {}
) => {
  const response = await axios.post(
    `${PAYSTACK_BASE}/transfer`,
    {
      source: "balance",
      amount: amount * 100, // in kobo
      recipient: recipientCode,
      reason,
      metadata,
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data; // contains status, transfer_code, reference
};


