import express from "express";
import * as OfferController from "../controllers/offer.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/createOffer", verifyToken, OfferController.handleCreateOffer);
router.post("/:offerId/accept", verifyToken, OfferController.handleVendorAccept);
router.get("/:offerId/vendors", verifyToken, OfferController.handleGetVendorsForOffer);
router.post("/select-vendor", verifyToken, OfferController.handleClientSelectVendor);
router.get("/nearbyOffers", verifyToken, OfferController.getNearbyOffersHandler);

export default router;
