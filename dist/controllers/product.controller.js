"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllProducts = exports.fetchVendorProducts = exports.addProduct = void 0;
const product_service_1 = require("../services/product.service");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const product_service_2 = require("../services/product.service");
const addProduct = async (req, res) => {
    const { productName } = req.body;
    const price = parseFloat(req.body.price);
    const qtyAvailable = parseInt(req.body.qtyAvailable);
    console.log(typeof (price));
    console.log(typeof (qtyAvailable));
    //         if (isNaN(price) || isNaN(qtyAvailable)) {
    //   return res.status(400).json({ error: "Price and quantity must be valid numbers" })
    // }
    if (!req.file) {
        return res.status(400).json({ error: "Product image is required" });
    }
    try {
        const cloudRes = await (0, cloudinary_1.default)(req.file.buffer, req.file.mimetype);
        const product = await (0, product_service_1.createProduct)(req.user.id, productName, price, qtyAvailable, cloudRes.secure_url);
        res.status(201).json({ success: true, message: "Product posted", data: product });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to upload product" });
    }
};
exports.addProduct = addProduct;
const fetchVendorProducts = async (req, res) => {
    try {
        const products = await (0, product_service_2.getVendorProducts)(req.user.id);
        res.json({ success: true, data: products });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.fetchVendorProducts = fetchVendorProducts;
const fetchAllProducts = async (_req, res) => {
    try {
        const products = await (0, product_service_2.getAllProducts)();
        res.json({ success: true, data: products });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.fetchAllProducts = fetchAllProducts;
