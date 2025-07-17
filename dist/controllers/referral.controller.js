"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferralHistory = void 0;
const referral_service_1 = require("../services/referral.service");
const getReferralHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const referrals = await (0, referral_service_1.getUserReferrals)(userId);
        res.status(200).json(referrals);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occured" });
    }
};
exports.getReferralHistory = getReferralHistory;
