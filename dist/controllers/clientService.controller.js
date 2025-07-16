"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVendorServices = exports.fetchAllServices = void 0;
const clientService_service_1 = require("../services/clientService.service");
const fetchAllServices = async (_req, res) => {
    try {
        const services = await (0, clientService_service_1.getAllVendorServices)();
        res.json({ success: true, data: services });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.fetchAllServices = fetchAllServices;
const fetchVendorServices = async (req, res) => {
    const { vendorId } = req.params;
    try {
        const services = await (0, clientService_service_1.getVendorServicesByVendorId)(vendorId);
        res.json({ success: true, data: services });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.fetchVendorServices = fetchVendorServices;
