// src/utils/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const uploadToCloudinary = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ secure_url: string }> => {
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

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "hairdesign/vendors",
      },
      (error: any, result: any) => {
        if (finished) return; // Prevent multiple responses
        finished = true;
        clearTimeout(timeout);

        if (error) {
          console.error("❌ Cloudinary upload error:", error);
          return reject(error);
        }

        console.log("✅ Cloudinary upload success:", result?.secure_url);
        resolve(result as { secure_url: string });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default uploadToCloudinary;
