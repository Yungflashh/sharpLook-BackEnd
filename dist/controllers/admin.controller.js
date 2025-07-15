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
exports.promoteToAdmin = exports.banUser = exports.getAllBookings = exports.getAllUsers = void 0;
const AdminService = __importStar(require("../services/admin.service"));
const getAllUsers = async (req, res) => {
    const users = await AdminService.getAllUsers();
    res.json({ success: true, data: users });
};
exports.getAllUsers = getAllUsers;
const getAllBookings = async (req, res) => {
    const bookings = await AdminService.getAllBookings();
    res.json({ success: true, data: bookings });
};
exports.getAllBookings = getAllBookings;
const banUser = async (req, res) => {
    const { userId } = req.params;
    await AdminService.banUser(userId);
    res.json({ success: true, message: "User banned" });
};
exports.banUser = banUser;
const promoteToAdmin = async (req, res) => {
    const { userId } = req.params;
    await AdminService.promoteUserToAdmin(userId);
    res.json({ success: true, message: "User promoted to ADMIN" });
};
exports.promoteToAdmin = promoteToAdmin;
