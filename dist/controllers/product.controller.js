"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProduct = exports.editProduct = exports.fetchTopSellingProducts = exports.fetchAllProducts = exports.fetchVendorProducts = exports.addProduct = void 0;
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
const fetchTopSellingProducts = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    try {
        const products = await (0, product_service_2.getTopSellingProducts)(limit);
        res.json({ success: true, data: products });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.fetchTopSellingProducts = fetchTopSellingProducts;
const editProduct = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        const { productId } = req.params;
        const { productName, price, qtyAvailable } = req.body;
        if (!productName || !price || qtyAvailable === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        let pictureUrl = undefined;
        if (req.file) {
            const cloudinaryRes = await (0, cloudinary_1.default)(req.file.buffer, req.file.mimetype);
            pictureUrl = cloudinaryRes.secure_url;
        }
        const updatedProduct = await (0, product_service_2.updateProduct)(productId, vendorId, productName, Number(price), Number(qtyAvailable), pictureUrl);
        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    }
    catch (error) {
        console.error("Error editing product:", error);
        res.status(500).json({ message: "Failed to update product" });
    }
};
exports.editProduct = editProduct;
const removeProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        await (0, product_service_2.deleteProduct)(productId);
        res.json({ success: true, message: "Product deleted" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.removeProduct = removeProduct;
