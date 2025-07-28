import express from "express";
import * as OfferController from "../controllers/offer.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { uploadSingle2 } from "../middlewares/upload.middleware";

const router = express.Router();

router.post("/createOffer", verifyToken, uploadSingle2, OfferController.handleCreateOffer);
router.post("/accept", verifyToken, OfferController.handleVendorAccept);
router.post("/vendors", verifyToken, OfferController.handleGetVendorsForOffer);
// router.post("/select-vendor", verifyToken, uploadSingle2, OfferController.selectVendorController);
router.get("/nearbyOffers", verifyToken, OfferController.getNearbyOffersHandler);
router.get("/allOffers", verifyToken, OfferController.getAllAvailableOffersHandler);
router.get("/myOffers",verifyToken ,OfferController.getMyOffers);
router.patch("/tip", verifyToken,OfferController.tipOffer);
router.post("/cancel", verifyToken, OfferController.handleCancelOffer);


export default router;
