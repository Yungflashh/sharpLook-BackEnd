"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = void 0;
const notification_service_1 = require("../services/notification.service");
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await (0, notification_service_1.getUserNotifications)(userId);
        res.json({ success: true, data: notifications });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getNotifications = getNotifications;
