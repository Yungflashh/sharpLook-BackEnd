"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVendorOrderEmail = exports.sendMail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendMail = async (to, subject, html) => {
    await exports.transporter.sendMail({
        from: `"SHARPLOOK" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};
exports.sendMail = sendMail;
const sendVendorOrderEmail = async (to, { name, items, total, }) => {
    const productList = items
        .map((item) => `<li>${item.productName} — ₦${item.price} × ${item.quantity} = ₦${item.total}</li>`)
        .join("");
    const html = `
    <p>Hi ${name},</p>
    <p>Congratulations! You've just received a new order with the following item(s):</p>
    <ul>${productList}</ul>
    <p><strong>Total: ₦${total}</strong></p>
    <p>Log in to your dashboard to manage your orders.</p>
    <p>— Your SHARP Platform</p>
  `;
    // Replace with nodemailer, sendgrid, or any provider
    await (0, exports.sendMail)(to, "New Product Order Received", html);
};
exports.sendVendorOrderEmail = sendVendorOrderEmail;
