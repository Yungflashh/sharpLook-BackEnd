"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReferrals = exports.trackReferral = void 0;
// services/referral.service.ts
const prisma_1 = __importDefault(require("../config/prisma"));
const trackReferral = async (referredById, referredUserId) => {
    return await prisma_1.default.referral.create({
        data: {
            referredById,
            referredUserId,
        }
    });
};
exports.trackReferral = trackReferral;
const getUserReferrals = async (userId) => {
    return await prisma_1.default.referral.findMany({
        where: { referredById: userId },
        include: {
            referredUser: true
        }
    });
};
exports.getUserReferrals = getUserReferrals;
