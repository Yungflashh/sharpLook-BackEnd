"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientLocationPreferences = exports.updateUserProfile = exports.getUserById = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getUserById = async (id) => {
    return await prisma_1.default.user.findUnique({ where: { id } });
};
exports.getUserById = getUserById;
const updateUserProfile = async (id, data) => {
    return await prisma_1.default.user.update({
        where: { id },
        data
    });
};
exports.updateUserProfile = updateUserProfile;
const updateClientLocationPreferences = async (userId, latitude, longitude, radiusKm) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            preferredLatitude: latitude,
            preferredLongitude: longitude,
            preferredRadiusKm: radiusKm,
        },
    });
};
exports.updateClientLocationPreferences = updateClientLocationPreferences;
