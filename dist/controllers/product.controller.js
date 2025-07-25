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
    const { productName, description } = req.body;
    const price = parseFloat(req.body.price);
    const qtyAvailable = parseInt(req.body.qtyAvailable);
    if (!productName || isNaN(price) || isNaN(qtyAvailable)) {
        return res.status(400).json({
            success: false,
            message: "Product name, price, and quantity are required and must be valid"
        });
    }
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Product image is required"
        });
    }
    try {
        const cloudRes = await (0, cloudinary_1.default)(req.file.buffer, req.file.mimetype);
        const product = await (0, product_service_1.createProduct)(req.user.id, productName, price, qtyAvailable, description, cloudRes.secure_url);
        return res.status(201).json({
            success: true,
            message: "Product posted successfully",
            data: product
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to upload product"
        });
    }
};
exports.addProduct = addProduct;
const fetchVendorProducts = async (req, res) => {
    try {
        const products = await (0, product_service_2.getVendorProducts)(req.user.id);
        return res.status(200).json({
            success: true,
            message: "Vendor products fetched successfully",
            data: products
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.fetchVendorProducts = fetchVendorProducts;
const fetchAllProducts = async (_req, res) => {
    try {
        const products = await (0, product_service_2.getAllProducts)();
        return res.status(200).json({
            success: true,
            message: "All products fetched successfully",
            data: products
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.fetchAllProducts = fetchAllProducts;
const fetchTopSellingProducts = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    try {
        const products = await (0, product_service_2.getTopSellingProducts)(limit);
        return res.status(200).json({
            success: true,
            message: "Top selling products fetched successfully",
            data: products
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.fetchTopSellingProducts = fetchTopSellingProducts;
const editProduct = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        const { productId } = req.params;
        const { productName, price, qtyAvailable, description } = req.body;
        if (!productName || !price || qtyAvailable === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }
        let pictureUrl = undefined;
        if (req.file) {
            const cloudinaryRes = await (0, cloudinary_1.default)(req.file.buffer, req.file.mimetype);
            pictureUrl = cloudinaryRes.secure_url;
        }
        const updatedProduct = await (0, product_service_2.updateProduct)(productId, vendorId, productName, Number(price), Number(qtyAvailable), description, pictureUrl);
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    }
    catch (err) {
        console.error("Error editing product:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to update product"
        });
    }
};
exports.editProduct = editProduct;
const removeProduct = async (req, res) => {
    const { productId } = req.body;
    try {
        await (0, product_service_2.deleteProduct)(productId);
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
exports.removeProduct = removeProduct;
