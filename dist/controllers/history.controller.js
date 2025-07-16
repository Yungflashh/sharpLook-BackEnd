"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUpcomingHistory = exports.fetchPastHistory = void 0;
const history_service_1 = require("../services/history.service");
const fetchPastHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const rawRole = req.user.role;
        if (!["CLIENT", "VENDOR"].includes(rawRole)) {
            return res.status(400).json({ error: "Invalid user role" });
        }
        const role = rawRole;
        const history = await (0, history_service_1.getPastBookings)(userId, role);
        res.json({ success: true, data: history });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.fetchPastHistory = fetchPastHistory;
const fetchUpcomingHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const rawRole = req.user.role;
        if (!["CLIENT", "VENDOR"].includes(rawRole)) {
            return res.status(400).json({ error: "Invalid user role" });
        }
        const role = rawRole;
        const history = await (0, history_service_1.getUpcomingBookings)(userId, role);
        res.json({ success: true, data: history });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.fetchUpcomingHistory = fetchUpcomingHistory;
