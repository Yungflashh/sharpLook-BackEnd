"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVendorServices = exports.createVendorService = void 0;
const vendorService_service_1 = require("../services/vendorService.service");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const createVendorService = async (req, res) => {
    const { serviceName, servicePrice } = req.body;
    const file = req.file;
    const vendorId = req.user?.id;
    if (!file || !serviceName || !servicePrice)
        return res.status(400).json({ error: "All fields are required" });
    try {
        const upload = await (0, cloudinary_1.default)(file.buffer, "vendor_services");
        const service = await (0, vendorService_service_1.addVendorService)(vendorId, serviceName, parseFloat(servicePrice), upload.secure_url);
        res.status(201).json({ success: true, data: service });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createVendorService = createVendorService;
const fetchVendorServices = async (req, res) => {
    const vendorId = req.user?.id;
    try {
        const services = await (0, vendorService_service_1.getVendorServices)(vendorId);
        res.json({ success: true, data: services });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.fetchVendorServices = fetchVendorServices;
