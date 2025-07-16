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
exports.removeProductFromWishlist = exports.getMyWishlist = exports.addProductToWishlist = void 0;
const WishlistService = __importStar(require("../services/wishlist.service"));
const addProductToWishlist = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;
    if (!productId)
        return res.status(400).json({ error: "Product ID is required" });
    try {
        const item = await WishlistService.addToWishlist(userId, productId);
        res.status(201).json({ success: true, data: item });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.addProductToWishlist = addProductToWishlist;
const getMyWishlist = async (req, res) => {
    const userId = req.user.id;
    try {
        const wishlist = await WishlistService.getUserWishlist(userId);
        res.json({ success: true, data: wishlist });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMyWishlist = getMyWishlist;
const removeProductFromWishlist = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    try {
        await WishlistService.removeFromWishlist(userId, productId);
        res.json({ success: true, message: "Removed from wishlist" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.removeProductFromWishlist = removeProductFromWishlist;
