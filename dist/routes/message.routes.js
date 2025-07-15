"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/message.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const message_controller_1 = require("../controllers/message.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verifyToken);
router.get("/:roomId", message_controller_1.fetchMessages);
router.patch("/:roomId/read", message_controller_1.markAsRead);
router.patch("/:messageId/like", message_controller_1.likeMessage);
exports.default = router;
