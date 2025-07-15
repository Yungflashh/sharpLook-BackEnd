"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorReviews = exports.createReview = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createReview = async (vendorId, clientId, bookingId, rating, comment) => {
    return await prisma_1.default.review.create({
        data: {
            vendorId,
            clientId,
            bookingId,
            rating,
            comment,
        },
    });
};
exports.createReview = createReview;
const getVendorReviews = async (vendorId) => {
    return await prisma_1.default.review.findMany({
        where: { vendorId },
        include: { client: true, booking: true },
    });
};
exports.getVendorReviews = getVendorReviews;
