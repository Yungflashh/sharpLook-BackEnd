"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVendorPricing = exports.setVendorPricing = void 0;
const vendorPricing_service_1 = require("../services/vendorPricing.service");
const setVendorPricing = async (req, res) => {
    try {
        const pricing = req.body.pricing;
        if (!pricing)
            return res.status(400).json({ error: "Pricing data is required" });
        const updated = await (0, vendorPricing_service_1.updateVendorPricing)(req.user.id, pricing);
        res.json({ success: true, message: "Pricing updated", data: updated });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.setVendorPricing = setVendorPricing;
const fetchVendorPricing = async (req, res) => {
    try {
        const pricing = await (0, vendorPricing_service_1.getVendorPricing)(req.user.id);
        res.json({ success: true, data: pricing });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.fetchVendorPricing = fetchVendorPricing;
