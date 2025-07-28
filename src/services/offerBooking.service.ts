// import prisma from "../config/prisma";
// import { BookingStatus, PaymentStatus, Booking } from "@prisma/client";
// import { debitWallet, getUserWallet, creditWallet } from "./wallet.service";
// import { verifyPayment } from "../utils/paystack"; // if Paystack used
// export const createOfferBooking = async ({
//   clientId,
//   vendorId,
//   offerId,
//   serviceOfferId,
//   paymentMethod,
//   serviceName,
//   serviceType,
//   offerAmount,
//   totalAmount,
//   price,
//   date,
//   time,
//   reference,
//   serviceImage,
//   referencePhoto, // <-- can be top-level or inside locationDetails depending on your model
//   locationDetails,
// }: {
//   clientId: string;
//   vendorId: string;
//   offerId: string;
//   serviceOfferId: string;
//   paymentMethod: string;
//   serviceName: string;
//   serviceType: string;
//   offerAmount: number;
//   totalAmount: number;
//   price: number;
//   date: string;
//   time: string;
//   reference: string;
//   serviceImage: string;
//   referencePhoto?: string;
//   locationDetails: {
//     homeLocation?: string;
//     fullAddress?: string;
//     landMark?: string;
//     referencePhoto?: string;
//     specialInstruction?: string;
//   };
// }) => {
//   if (paymentMethod === "SHARP-PAY") {
//     const wallet = await getUserWallet(clientId);
//     if (!wallet || wallet.balance < price) {
//       throw new Error("Insufficient wallet balance");
//     }

//     await debitWallet(wallet.id, price, "Booking Payment", reference);
//   }

//   return await prisma.serviceOfferBooking.create({
//     data: {
//       clientId,
//       vendorId,
//       serviceOfferId,
//       serviceName,
//       price,
//       totalAmount,
//       time,
//       date: new Date(date),
//       paymentMethod,
//       paymentStatus: PaymentStatus.LOCKED,
//       reference,
//       referencePhoto,
//       status: BookingStatus.PENDING,
//     },
//     include: {
//       client: true,
//       vendor: true,
//       serviceOffer: true,
//     },
//   });
// };
