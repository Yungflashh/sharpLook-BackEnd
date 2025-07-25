"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("../controllers/review.controller");
const review_controller_2 = require("../controllers/review.controller");
const router = express_1.default.Router();
// router.post("/postReview", verifyToken, postReview)
router.post('/reviews/booking', review_controller_2.postBookingReview);
router.post('/product', review_controller_2.postProductReview);
router.post('/reviews/service', review_controller_2.postServiceReview);
router.post("/getAllReviews", review_controller_1.fetchVendorReviews);
router.get("/:vendorId/service/:serviceId/reviews", review_controller_1.handleGetServiceReviewsByVendor);
router.get("/:vendorId/product/:productId/reviews", review_controller_1.handleGetProductReviewsByVendor);
exports.default = router;
