"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/booking.routes.ts
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/createBooking", auth_middleware_1.verifyToken, booking_controller_1.create);
router.get("/getBooking", auth_middleware_1.verifyToken, booking_controller_1.getByUser);
router.patch("/:id/status", auth_middleware_1.verifyToken, booking_controller_1.updateStatus);
exports.default = router;
