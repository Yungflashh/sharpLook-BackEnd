"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDisputeStatus = exports.getAllDisputes = exports.createDispute = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createDispute = async (bookingId, raisedById, reason, imageUrl) => {
    return await prisma_1.default.dispute.create({
        data: {
            bookingId,
            raisedById,
            reason,
            imageUrl,
        },
    });
};
exports.createDispute = createDispute;
const getAllDisputes = async () => {
    return await prisma_1.default.dispute.findMany({
        include: {
            raisedBy: {
                select: { firstName: true, lastName: true, role: true },
            },
            booking: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getAllDisputes = getAllDisputes;
const updateDisputeStatus = async (disputeId, status, resolution) => {
    return await prisma_1.default.dispute.update({
        where: { id: disputeId },
        data: { status, resolution },
    });
};
exports.updateDisputeStatus = updateDisputeStatus;
