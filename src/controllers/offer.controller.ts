import { Request, Response } from "express";
import * as OfferService from "../services/offer.service";
import { notifyNearbyVendors } from "../services/notification.service";

export const handleCreateOffer = async (req: Request, res: Response) => {
  const data = req.body;
  const clientId = req.user!.id;

  const offer = await OfferService.createServiceOffer(clientId, data);


  await notifyNearbyVendors(offer); // You’ll write this function

  res.json({ success: true, data: offer });
};

export const handleVendorAccept = async (req: Request, res: Response) => {
  const vendorId = req.user!.id;
  const { offerId } = req.params;

  const result = await OfferService.vendorAcceptOffer(vendorId, offerId);
  res.json({ success: true, message: "Offer accepted", data: result });
};

export const handleClientSelectVendor = async (req: Request, res: Response) => {
  const { offerId, vendorId } = req.body;

  await OfferService.selectVendorForOffer(offerId, vendorId);
  res.json({ success: true, message: "Vendor selected" });
};

export const handleGetVendorsForOffer = async (req: Request, res: Response) => {
  const { offerId } = req.params;

  const vendors = await OfferService.getVendorsForOffer(offerId);
  res.json({ success: true, data: vendors });
};


export const getNearbyOffersHandler = async (req: Request, res: Response) => {
  const vendorId = req.user!.id;

  try {
    const offers = await OfferService.getNearbyOffersByCoordinates(vendorId);
    res.status(200).json({ success: true, data: offers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleCancelOffer = async (req: Request, res: Response) => {
  const clientId = req.user!.id;
  const { offerId } = req.params;

  await OfferService.cancelOffer(offerId, clientId);
  res.json({ success: true, message: "Offer cancelled" });
};
