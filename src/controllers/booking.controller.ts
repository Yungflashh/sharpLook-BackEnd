import { Request, Response } from "express"
import * as BookingService from "../services/booking.service"
import { BookingStatus } from "@prisma/client"
import { createNotification } from "../services/notification.service"


export const bookVendor = async (req: Request, res: Response) => {
  const {
    vendorId,
    date,
    time,
    price,
    serviceName,
    location,
    paymentMethod,
    notes,
    status,
    serviceId
  } = req.body

  if (!vendorId || !date || !time || !price || !serviceName || !location || !paymentMethod || !status || !serviceId) {
    return res.status(400).json({ error: "Missing required booking details" })
  }

  const clientId = req.user?.id!

  try {
    const booking = await BookingService.createBooking(
      clientId,
      vendorId,
      date,
      time,
      price,
      serviceName,
      location,
      paymentMethod,
      notes || "",
      status,
      serviceId
    )

    await createNotification(
      vendorId,
      `You received a new booking request for ${serviceName} on ${date} at ${time}.`
    )

    await createNotification(
      clientId,
      `Your booking for ${serviceName} has been placed successfully.`
    )

    res.status(201).json({ success: true, data: booking })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}


export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as "CLIENT" | "VENDOR"
    const bookings = await BookingService.getUserBookings(req.user!.id, role)
    res.json({ success: true, data: bookings })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const changeBookingStatus = async (req: Request, res: Response) => {
  const { bookingId } = req.params
  const { status } = req.body

  try {
    const updated = await BookingService.updateBookingStatus(bookingId, status as BookingStatus)
    const booking = await BookingService.getBookingById(bookingId)

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    await createNotification(
      booking.clientId,
      `Your booking for ${booking.serviceName} was ${status.toLowerCase()}.`
    )

    await createNotification(
      booking.vendorId,
      `You ${status.toLowerCase()} a booking for ${booking.serviceName}.`
    )

    res.json({ success: true, message: "Booking status updated", data: updated })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
