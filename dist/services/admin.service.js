"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSoldProducts = exports.getAllProducts = exports.getDailyActiveUsers = exports.getNewUsersByRange = exports.getUsersByRole = exports.promoteUserToAdmin = exports.unbanUser = exports.banUser = exports.getAllBookings = exports.getAllUsers = void 0;
// src/services/admin.service.ts
const prisma_1 = __importDefault(require("../config/prisma"));
const date_fns_1 = require("date-fns");
const getAllUsers = async () => {
    return await prisma_1.default.user.findMany({
        select: { id: true, email: true, role: true, isEmailVerified: true },
    });
};
exports.getAllUsers = getAllUsers;
const getAllBookings = async () => {
    return await prisma_1.default.booking.findMany({
        include: { client: true, vendor: true },
    });
};
exports.getAllBookings = getAllBookings;
const banUser = async (userId) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: { isBanned: true },
    });
};
exports.banUser = banUser;
const unbanUser = async (userId) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: { isBanned: false },
    });
};
exports.unbanUser = unbanUser;
const promoteUserToAdmin = async (userId) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: { role: "ADMIN" },
    });
};
exports.promoteUserToAdmin = promoteUserToAdmin;
const getUsersByRole = async (role) => {
    return await prisma_1.default.user.findMany({
        where: { role },
        orderBy: { createdAt: "desc" }
    });
};
exports.getUsersByRole = getUsersByRole;
const getNewUsersByRange = async (range) => {
    let date;
    switch (range) {
        case "days":
            date = (0, date_fns_1.subDays)(new Date(), 7);
            break;
        case "weeks":
            date = (0, date_fns_1.subWeeks)(new Date(), 4);
            break;
        case "months":
            date = (0, date_fns_1.subMonths)(new Date(), 6);
            break;
        case "years":
            date = (0, date_fns_1.subYears)(new Date(), 1);
            break;
        default:
            throw new Error("Invalid range");
    }
    return await prisma_1.default.user.findMany({
        where: { createdAt: { gte: date } },
        orderBy: { createdAt: "desc" }
    });
};
exports.getNewUsersByRange = getNewUsersByRange;
const getDailyActiveUsers = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await prisma_1.default.user.findMany({
        where: { updatedAt: { gte: today } }
    });
};
exports.getDailyActiveUsers = getDailyActiveUsers;
const getAllProducts = async () => {
    return await prisma_1.default.product.findMany({
        orderBy: { createdAt: "desc" }
    });
};
exports.getAllProducts = getAllProducts;
const getSoldProducts = async () => {
    return await prisma_1.default.product.findMany({
        where: { qtyAvailable: 0 },
        orderBy: { createdAt: "desc" }
    });
};
exports.getSoldProducts = getSoldProducts;
