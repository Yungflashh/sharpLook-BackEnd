"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const vendor_routes_1 = __importDefault(require("./routes/vendor.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const earnings_routes_1 = __importDefault(require("./routes/earnings.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const promotion_routes_1 = __importDefault(require("./routes/promotion.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const vendorService_routes_1 = __importDefault(require("./routes/vendorService.routes"));
// For clients
const clientService_routes_1 = __importDefault(require("./routes/clientService.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/vendor", vendor_routes_1.default);
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/user", user_routes_1.default);
app.use("/api/v1/bookings", booking_routes_1.default);
app.use("/api/v1/products", product_routes_1.default);
app.use("/api/v1/earnings", earnings_routes_1.default);
app.use("/api/v1/notifications", notification_routes_1.default);
app.use("/api/v1/reviews", review_routes_1.default);
app.use("/api/v1/promotions", promotion_routes_1.default);
app.use("/api/v1/messages", message_routes_1.default);
app.use("/api/v1/vendorServices", vendorService_routes_1.default);
// For clients 
app.use("/api/v1/client", clientService_routes_1.default);
app.use("/api/v1/client", cart_routes_1.default);
app.get("/", (_, res) => res.send("🚀 SharpLook API is running"));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
exports.default = app;
