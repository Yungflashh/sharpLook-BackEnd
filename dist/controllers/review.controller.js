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
const postReview = async (req, res) => {
    const { bookingId, vendorId, rating, comment } = req.body;
    const clientId = req.user?.id;
    if (!bookingId || !vendorId || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const review = await ReviewService.createReview(vendorId, clientId, bookingId, rating, comment);
        res.status(201).json({ success: true, message: "Review posted", data: review });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.postReview = postReview;
const fetchVendorReviews = async (req, res) => {
    const vendorId = req.params.vendorId;
    try {
        const reviews = await ReviewService.getVendorReviews(vendorId);
        res.status(200).json({ success: true, data: reviews });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.fetchVendorReviews = fetchVendorReviews;
