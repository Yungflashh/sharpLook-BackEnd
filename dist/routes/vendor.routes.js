"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/vendor.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const vendor_controller_1 = require("../controllers/vendor.controller");
const vendor_controller_2 = require("../controllers/vendor.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
router.get("/dashboard", auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["VENDOR"]), (req, res) => {
    res.json({ message: "Welcome, Vendor!" });
});
router.put("/complete-profile", auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["VENDOR"]), vendor_controller_1.completeVendorProfile);
router.post("/upload", auth_middleware_1.verifyToken, upload_middleware_1.uploadMultiple, vendor_controller_2.uploadPortfolioImages);
router.get("/", auth_middleware_1.verifyToken, vendor_controller_2.fetchPortfolioImages);
exports.default = router;
