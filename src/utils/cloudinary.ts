// src/utils/cloudinary.ts
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const uploadToCloudinary = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error)
        resolve(result as { secure_url: string }) // ✅ cast result to expected shape
      }
    )
    stream.end(fileBuffer)
  })
}

export default uploadToCloudinary
