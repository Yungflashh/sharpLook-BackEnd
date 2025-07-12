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
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result); // ✅ cast result to expected shape
        });
        stream.end(fileBuffer);
    });
};
exports.default = uploadToCloudinary;
