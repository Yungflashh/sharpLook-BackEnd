import { Request, Response } from "express";
import * as BookingService from "../services/booking.service";
import { BookingStatus } from "@prisma/client";
import { createNotification } from "../services/notification.service";

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
  } = req.body;

  const paymentMethod = "SHARPPAY";  // Corrected to match your service
  // Payment status will be set inside the service based on wallet logic, so no need to send here.

  if (!vendorId || !date || !time || !price || !serviceName || !serviceId || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: "Missing required booking details",
    });
  }

  const clientId = req.user?.id!;

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
      reference
    );

    await createNotification(
      vendorId,
      `You received a new booking request for ${serviceName} on ${date} at ${time}.`
    );

    await createNotification(
      clientId,
      `Your booking for ${serviceName} has been placed successfully.`
    );

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
  const { bookingId } = req.params;
  const { status, completedBy, reference } = req.body;

  try {
    const booking = await BookingService.getBookingById(bookingId);


    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    let updatedBooking;

    if (status === "COMPLETED" && completedBy) {
      // Mark completion by client or vendor
      if (completedBy === "CLIENT") {
        updatedBooking = await BookingService.markBookingCompletedByClient(bookingId, reference);
        await createNotification(
          booking.vendorId,
          `Client marked booking for ${booking.serviceName} as completed.`
        );
      } else if (completedBy === "VENDOR") {
        updatedBooking = await BookingService.markBookingCompletedByVendor(bookingId, reference);
        await createNotification(
          booking.clientId,
          `Vendor marked booking for ${booking.serviceName} as completed.`
        );
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
        booking.clientId,
        `Your booking for ${booking.serviceName} was ${status.toLowerCase()}.`
      );

      await createNotification(
        booking.vendorId,
        `You ${status.toLowerCase()} a booking for ${booking.serviceName}.`
      );
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
    const {reference} = req.body
  try {
    const updatedBooking = await BookingService.markBookingCompletedByClient(req.params.bookingId, reference);
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

  const {reference} = req.body
  try {
    const updatedBooking = await BookingService.markBookingCompletedByVendor(req.params.bookingId, reference);
    return res.status(200).json({
      success: true,
      message: "Booking marked as completed by vendor.",
      data: updatedBooking,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
