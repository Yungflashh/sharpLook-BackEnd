"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.getMyProfile = void 0;
const user_services_1 = require("../services/user.services");
const getMyProfile = async (req, res) => {
    try {
        const user = await (0, user_services_1.getUserById)(req.user.id);
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res) => {
    try {
        const updated = await (0, user_services_1.updateUserProfile)(req.user.id, req.body);
        res.json({ message: "Profile updated", user: updated });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateMyProfile = updateMyProfile;
