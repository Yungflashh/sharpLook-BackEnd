import { Request, Response } from "express";
import * as BookingService from "../services/booking.service";
import { BookingStatus } from "@prisma/client";
import { createNotification } from "../services/notification.service";
import {
  homeServiceCreateBooking,
  acceptBooking,
  payForAcceptedBooking,
} from "../services/booking.service"
import uploadToCloudinary from "../utils/cloudinary";
import prisma from "../config/prisma";
import { pushNotificationService } from "../services/pushNotifications.service";
import { notifyUser } from "../helpers/notifyUser.helper"; 


export const bookVendor = async (req: Request, res: Response) => {
  const {
    vendorId,
    date,
    time,
    price,
    serviceName,
    serviceId,
    totalAmount,
    reference,
    paymentMethod
  } = req.body;

    // Corrected to match your service
  // Payment status will be set inside the service based on wallet logic, so no need to send here.

  if (!vendorId || !date || !time || !price || !serviceName || !serviceId || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: "Missing required booking details",
    });
  }

  const clientId = req.user?.id!;
  
    let referencePhoto = "";

    // Upload image if file is present
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          req.file.mimetype
        );
        referencePhoto = uploadResult.secure_url;
      } catch (uploadErr: any) {
        console.error("Image upload error:", uploadErr);
        return res.status(500).json({
          error: "Failed to upload reference photo. Please try again.",
        });
      }
    }
  try {
    const booking = await BookingService.createBooking(
      clientId,
      vendorId,
      serviceId,
      paymentMethod,
      serviceName,
      price,
      totalAmount,
      time,
      date,
      reference,
      referencePhoto
    );

    await createNotification(
      vendorId,
      `You received a new booking request for ${serviceName} on ${date} at ${time}.`
    );

    await createNotification(
      clientId,
      `Your booking for ${serviceName} has been placed successfully.`
    );


        const vendorUser = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { fcmToken: true },  // Ensure you have fcmToken in user table
    });

    if (vendorUser?.fcmToken) {
      await pushNotificationService.sendPushNotification(
        vendorUser.fcmToken,
        'New Booking Request',
        `You have a new booking request for ${serviceName} on ${date} at ${time}.`
      );
    }

    const clientUser = await prisma.user.findUnique({
      where: { id: clientId },
      select: { fcmToken: true },
    });

    if (clientUser?.fcmToken) {
      await pushNotificationService.sendPushNotification(
        clientUser.fcmToken,
        'Booking Confirmed',
        `Your booking for ${serviceName} on ${date} at ${time} was successful.`
      );
    }


    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as "CLIENT" | "VENDOR";
    const bookings = await BookingService.getUserBookings(req.user!.id, role);

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const changeBookingStatus = async (req: Request, res: Response) => {
  const { status, completedBy, reference, bookingId } = req.body;

  try {
    const booking = await BookingService.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const clientUser = await prisma.user.findUnique({
      where: { id: booking.clientId! },
      select: { fcmToken: true },
    });

    const vendorUser = await prisma.user.findUnique({
      where: { id: booking.vendorId },
      select: { fcmToken: true },
    });

    let updatedBooking;

    if (status === "COMPLETED" && completedBy) {
      if (completedBy === "CLIENT") {
        updatedBooking = await BookingService.markBookingCompletedByClient(bookingId, reference);

        await createNotification(
          booking.vendorId,
          `Client marked booking for ${booking.serviceName} as completed.`
        );

        if (vendorUser?.fcmToken) {
          await pushNotificationService.sendPushNotification(
            vendorUser.fcmToken,
            'Booking Completed',
            `Client marked booking for ${booking.serviceName} as completed.`
          );
        }

      } else if (completedBy === "VENDOR") {
        updatedBooking = await BookingService.markBookingCompletedByVendor(bookingId, reference);

        await createNotification(
          booking.clientId!,
          `Vendor marked booking for ${booking.serviceName} as completed.`
        );

        if (clientUser?.fcmToken) {
          await pushNotificationService.sendPushNotification(
            clientUser.fcmToken,
            'Booking Completed',
            `Vendor marked booking for ${booking.serviceName} as completed.`
          );
        }

      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid 'completedBy' value. Must be 'CLIENT' or 'VENDOR'."
        });
      }

    } else {
      // Normal status update: ACCEPTED, REJECTED, PENDING, etc.
      updatedBooking = await BookingService.updateBookingStatus(bookingId, status as BookingStatus);

      await createNotification(
        booking.clientId!,
        `Your booking for ${booking.serviceName} was ${status.toLowerCase()}.`
      );

      await createNotification(
        booking.vendorId,
        `You ${status.toLowerCase()} a booking for ${booking.serviceName}.`
      );

      if (status === "ACCEPTED" && clientUser?.fcmToken) {
        await pushNotificationService.sendPushNotification(
          clientUser.fcmToken,
          'Booking Accepted',
          `Your booking for ${booking.serviceName} has been accepted.`
        );
      }

      if (vendorUser?.fcmToken) {
        await pushNotificationService.sendPushNotification(
          vendorUser.fcmToken,
          'Booking Status Updated',
          `You ${status.toLowerCase()} a booking for ${booking.serviceName}.`
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



export const markBookingCompletedByClient = async (req: Request, res: Response) => {
  const { reference, bookingId } = req.body;
  const userId = req.user!.id;

  try {
    const updatedBooking = await BookingService.markBookingCompletedByClient(bookingId, reference);

    await createNotification(
      userId,
      `You have successfully marked a booking as completed.`
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      await pushNotificationService.sendPushNotification(
        user.fcmToken,
        'Booking Completed',
        `You have successfully marked a booking as completed.`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Booking marked as completed by client.",
      data: updatedBooking,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const markBookingCompletedByVendor = async (req: Request, res: Response) => {
  const { reference, bookingId } = req.body;
  const userId = req.user!.id;

  try {
    const updatedBooking = await BookingService.markBookingCompletedByVendor(bookingId, reference);

    await createNotification(
      userId,
      `You have successfully marked a booking as completed.`
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      await pushNotificationService.sendPushNotification(
        user.fcmToken,
        'Booking Completed',
        `You have successfully marked a booking as completed.`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Booking marked as completed by vendor.",
      data: updatedBooking,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



// hpome servcie 


export const createHomeServiceBooking = async (req: Request, res: Response) => {
  try {
    const {
      clientId,
      vendorId,
      serviceId,
      paymentMethod,
      serviceName,
      price,
      totalAmount,
      time,
      date,
      reference,
      serviceType,
      serviceLocation,
      fullAddress,
      landmark,
      specialInstruction,
    } = req.body;

    // Validate required fields
    if (
      !clientId ||
      !vendorId ||
      !serviceId ||
      !paymentMethod ||
      !serviceName ||
      !price ||
      !totalAmount ||
      !time ||
      !date ||
      !serviceLocation ||
      !fullAddress
    ) {
      return res.status(400).json({
        error: "Missing required fields. Please fill all mandatory fields.",
      });
    }

    let referencePhotoUrl = "";

    // Upload image if file is present
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          req.file.mimetype
        );
        referencePhotoUrl = uploadResult.secure_url;
      } catch (uploadErr: any) {
        console.error("Image upload error:", uploadErr);
        return res.status(500).json({
          error: "Failed to upload reference photo. Please try again.",
        });
      }
    }

    // Create booking
    let booking;
    try {
      booking = await homeServiceCreateBooking(
        clientId,
        vendorId,
        serviceId,
        paymentMethod,
        serviceName,
        Number(price),
        Number(totalAmount),
        time,
        date,
        reference,
        serviceType,
        {
          serviceLocation,
          fullAddress,
          landmark,
          referencePhoto: referencePhotoUrl,
          specialInstruction,
        }
      );
    } catch (bookingErr: any) {
      console.error("Booking creation failed:", bookingErr);
      return res.status(500).json({
        error: "Failed to create booking. Please try again later.",
      });
    }

    // Get vendor's user ID
    let vendor;
    try {
      vendor = await prisma.vendorOnboarding.findUnique({
        where: { id: vendorId },
        select: {
          user: {
            select: { id: true, firstName: true },
          },
        },
      });
    } catch (vendorFetchErr: any) {
      console.error("Failed to fetch vendor data:", vendorFetchErr);
      return res.status(500).json({
        error: "Failed to fetch vendor information.",
      });
    }

    // Notify vendor if available
    if (vendor?.user?.id) {
      const vendorUserId = vendor.user.id;
      await createNotification(
        vendorUserId,
        `You have a new home service booking for ${serviceName} on ${date} at ${time}`
      );

      await notifyUser(
        vendorUserId,
        'New Home Service Booking',
        `You have a new booking for ${serviceName} on ${date} at ${time}.`
      );
    }

    // Notify client
    await createNotification(
      clientId,
      `Your booking for ${serviceName} on ${date} at ${time} was successful.`
    );

    await notifyUser(
      clientId,
      'Booking Confirmed',
      `Your booking for ${serviceName} on ${date} at ${time} was successful.`
    );

    return res.status(201).json({
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err: any) {
    console.error("Create booking error:", err);
    return res.status(500).json({
      error: err.message || "An unexpected server error occurred.",
    });
  }
};
export const acceptBookingHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const vendorId = req.user!.id;

    const booking = await acceptBooking(vendorId, bookingId);

    // Notify client about acceptance
    if (booking.clientId) {
      await notifyUser(
        booking.clientId,
        'Booking Accepted',
        `Your booking for ${booking.serviceName} has been accepted.`
      );

      await createNotification(
        booking.clientId,
        `Your booking for ${booking.serviceName} has been accepted.`
      );
    }

    res.json({
      success: true,
      message: "Booking accepted",
      data: booking,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to accept booking",
    });
  }
};
export const payForBookingHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const clientId = req.user!.id;
    const { reference, paymentMethod } = req.body;

    const booking = await payForAcceptedBooking(clientId, bookingId, reference, paymentMethod);

    // Notify Vendor about Payment
    if (booking.vendorId) {
      await notifyUser(
        booking.vendorId,
        'Payment Received',
        `You have received payment for the booking of ${booking.serviceName}.`
      );

      await createNotification(
        booking.vendorId,
        `You have received payment for the booking of ${booking.serviceName}.`
      );
    }

    res.json({ success: true, message: "Booking paid", data: booking });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to pay for booking",
    });
  }
};