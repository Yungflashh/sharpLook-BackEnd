"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = express_1.default.Router();
router.post("/vendor/addProducts", auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["VENDOR"]), upload_middleware_1.uploadSingle2, product_controller_1.addProduct);
router.get("/getVendorProducts", auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["VENDOR"]), product_controller_1.fetchVendorProducts);
router.get("/getAllProducts", product_controller_1.fetchAllProducts);
router.put("/:productId", auth_middleware_1.verifyToken, upload_middleware_1.uploadSingle2, (0, auth_middleware_1.requireRole)(["VENDOR"]), product_controller_1.editProduct);
router.delete("/:productId", auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["VENDOR"]), product_controller_1.removeProduct);
exports.default = router;
