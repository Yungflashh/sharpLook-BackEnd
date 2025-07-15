"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promoteUserToAdmin = exports.unbanUser = exports.banUser = exports.getAllBookings = exports.getAllUsers = void 0;
// src/services/admin.service.ts
const prisma_1 = __importDefault(require("../config/prisma"));
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
