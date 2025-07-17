"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = void 0;
const notification_service_1 = require("../services/notification.service");
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await (0, notification_service_1.getUserNotifications)(userId);
        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: notifications
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
exports.getNotifications = getNotifications;
