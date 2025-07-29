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
    return response.data.data;
  } catch (error: any) {
    console.error("Payment verification failed:", error.response?.data || error.message);
    throw new Error("Failed to verify payment");
  }
};



export const generateReference = () => `REF-${uuidv4()}`;

