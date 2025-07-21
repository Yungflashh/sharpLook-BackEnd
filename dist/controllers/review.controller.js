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
exports.fetchVendorReviews = exports.postReview = void 0;
const ReviewService = __importStar(require("../services/review.service"));
const client_1 = require("@prisma/client");
const postReview = async (req, res) => {
    const { bookingId, productId, serviceId, vendorId, rating, comment, type } = req.body;
    const clientId = req.user?.id;
    // ✅ Validate required fields
    if (!vendorId || !clientId || !rating || !type) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: vendorId, clientId, rating, or type",
        });
    }
    // ✅ Enforce type-specific ID requirement
    const missingContext = (type === 'BOOKING' && !bookingId) ||
        (type === 'PRODUCT' && !productId) ||
        (type === 'SERVICE' && !serviceId) ||
        (type === 'VENDOR' && (bookingId || productId || serviceId)); // VENDOR should have no others
    if (missingContext) {
        return res.status(400).json({
            success: false,
            message: `Missing or invalid ID for review type "${type}"`,
        });
    }
    try {
        const review = await ReviewService.createReview({
            vendorId,
            clientId,
            rating,
            comment,
            bookingId,
            productId,
            serviceId,
            type,
        });
        return res.status(201).json({
            success: true,
            message: "Review posted successfully",
            data: review,
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "Failed to post review",
        });
    }
};
exports.postReview = postReview;
const fetchVendorReviews = async (req, res) => {
    const { vendorId, type } = req.body;
    try {
        // Validate and convert type string to enum
        let reviewType;
        if (type && Object.values(client_1.ReviewType).includes(type)) {
            reviewType = type;
        }
        const reviews = await ReviewService.getVendorReviews(vendorId, reviewType);
        return res.status(200).json({
            success: true,
            message: "Vendor reviews fetched successfully",
            data: reviews,
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "Failed to fetch vendor reviews",
        });
    }
};
exports.fetchVendorReviews = fetchVendorReviews;
