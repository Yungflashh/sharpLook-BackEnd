"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/cloudinary.ts
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = async (fileBuffer, mimeType) => {
    console.log("📦 Starting Cloudinary upload...");
    return new Promise((resolve, reject) => {
        let finished = false; // Prevent multiple calls
        const timeout = setTimeout(() => {
            if (!finished) {
                finished = true;
                console.error("❌ Cloudinary upload timed out");
                reject(new Error("Cloudinary upload timed out"));
            }
        }, 50000); // ⬅️ You can increase to 20s safely
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: "image",
            folder: "hairdesign/vendors",
        }, (error, result) => {
            if (finished)
                return; // Prevent multiple responses
            finished = true;
            clearTimeout(timeout);
            if (error) {
                console.error("❌ Cloudinary upload error:", error);
                return reject(error);
            }
            console.log("✅ Cloudinary upload success:", result?.secure_url);
            resolve(result);
        });
        uploadStream.end(fileBuffer);
    });
};
exports.default = uploadToCloudinary;
