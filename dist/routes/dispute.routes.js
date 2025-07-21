"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dispute_controller_1 = require("../controllers/dispute.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware"); // adjust as needed
const router = express_1.default.Router();
// 🔒 Auth required
router.post("/raiseDispute", auth_middleware_1.verifyToken, dispute_controller_1.raiseDispute);
// 🔒 Admin only
router.get("/getAllDisputes", auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["ADMIN", "SUPERADMIN"]), dispute_controller_1.getDisputes);
router.patch("/resolveDispute", auth_middleware_1.verifyToken, (0, auth_middleware_1.requireRole)(["ADMIN", "SUPERADMIN"]), dispute_controller_1.resolveDispute);
exports.default = router;
