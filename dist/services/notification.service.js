"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserNotifications = exports.createNotification = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createNotification = async (userId, message, type = "BOOKING") => {
    return await prisma_1.default.notification.create({
        data: {
            userId,
            message,
            type,
        },
    });
};
exports.createNotification = createNotification;
const getUserNotifications = async (userId) => {
    return await prisma_1.default.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};
exports.getUserNotifications = getUserNotifications;
