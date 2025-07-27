"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAvailableOffersHandler = exports.handleCancelOffer = exports.getNearbyOffersHandler = exports.handleGetVendorsForOffer = exports.handleClientSelectVendor = exports.handleVendorAccept = exports.handleCreateOffer = void 0;
const OfferService = __importStar(require("../services/offer.service"));
const notification_service_1 = require("../services/notification.service");
const cloudinary_1 = require("../utils/cloudinary");
const handleCreateOffer = async (req, res) => {
    const data = req.body;
    const clientId = req.user.id;
    let serviceImageUrl = "";
    if (req.file) {
        // Upload to Cloudinary
        const result = await (0, cloudinary_1.uploadBufferToCloudinary)(req.file.buffer, "SharpLook/ServiceOffers");
        serviceImageUrl = result.secure_url;
    }
    let serviceImage = serviceImageUrl;
    const offer = await OfferService.createServiceOffer(clientId, data, serviceImage);
    await (0, notification_service_1.notifyNearbyVendors)(offer);
    res.json({ success: true, data: offer });
};
exports.handleCreateOffer = handleCreateOffer;
const handleVendorAccept = async (req, res) => {
    const vendorId = req.user.id;
    const { offerId } = req.params;
    const result = await OfferService.vendorAcceptOffer(vendorId, offerId);
    res.json({ success: true, message: "Offer accepted", data: result });
};
exports.handleVendorAccept = handleVendorAccept;
const handleClientSelectVendor = async (req, res) => {
    const { offerId, vendorId } = req.body;
    await OfferService.selectVendorForOffer(offerId, vendorId);
    res.json({ success: true, message: "Vendor selected" });
};
exports.handleClientSelectVendor = handleClientSelectVendor;
const handleGetVendorsForOffer = async (req, res) => {
    const { offerId } = req.params;
    const vendors = await OfferService.getVendorsForOffer(offerId);
    res.json({ success: true, data: vendors });
};
exports.handleGetVendorsForOffer = handleGetVendorsForOffer;
const getNearbyOffersHandler = async (req, res) => {
    const vendorId = req.user.id;
    try {
        const offers = await OfferService.getNearbyOffersByCoordinates(vendorId);
        res.status(200).json({ success: true, data: offers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getNearbyOffersHandler = getNearbyOffersHandler;
const handleCancelOffer = async (req, res) => {
    const clientId = req.user.id;
    const { offerId } = req.params;
    await OfferService.cancelOffer(offerId, clientId);
    res.json({ success: true, message: "Offer cancelled" });
};
exports.handleCancelOffer = handleCancelOffer;
const getAllAvailableOffersHandler = async (req, res) => {
    try {
        const offers = await OfferService.getAllAvailableOffers(); // you'll write this in the service
        res.status(200).json({ success: true, data: offers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllAvailableOffersHandler = getAllAvailableOffersHandler;
