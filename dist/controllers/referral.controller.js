"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferralHistory = void 0;
const referral_service_1 = require("../services/referral.service");
const getReferralHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const referrals = await (0, referral_service_1.getUserReferrals)(userId);
        return res.status(200).json({
            success: true,
            message: "Referral history fetched successfully",
            data: referrals,
        });
    }
    catch (error) {
        console.error("Error fetching referral history:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching referral history",
        });
    }
};
exports.getReferralHistory = getReferralHistory;
