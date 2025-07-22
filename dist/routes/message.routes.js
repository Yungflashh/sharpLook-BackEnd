"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/message.routes.ts
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const router = (0, express_1.Router)();
router.get("/:roomId", message_controller_1.fetchMessages);
router.patch("/:roomId/read", message_controller_1.markAsRead);
router.patch("/:messageId/like", message_controller_1.likeMessage);
router.get("/unread/count", message_controller_1.getUnreadMessageCount);
exports.default = router;
