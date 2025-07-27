import express from "express";
import * as OfferController from "../controllers/offer.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { uploadSingle2 } from "../middlewares/upload.middleware";

const router = express.Router();

router.post("/createOffer", verifyToken, uploadSingle2, OfferController.handleCreateOffer);
router.post("/:offerId/accept", verifyToken, OfferController.handleVendorAccept);
router.get("/:offerId/vendors", verifyToken, OfferController.handleGetVendorsForOffer);
router.post("/select-vendor", verifyToken, OfferController.handleClientSelectVendor);
router.get("/nearbyOffers", verifyToken, OfferController.getNearbyOffersHandler);
router.get("/allOffers", verifyToken, OfferController.getAllAvailableOffersHandler);

export default router;
