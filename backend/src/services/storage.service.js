import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/config.js";

const cloudinaryReady = Boolean(config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET);
if (cloudinaryReady) {
  cloudinary.config({ cloud_name: config.CLOUDINARY_CLOUD_NAME, api_key: config.CLOUDINARY_API_KEY, api_secret: config.CLOUDINARY_API_SECRET });
}

export async function uploadFile({ buffer, mimeType, folder = "medlar_products" }) {
  if (!buffer || buffer.length === 0) throw new Error("Image buffer is missing or empty");
  if (!mimeType?.startsWith("image/")) throw new Error("Only image files are allowed");
  if (!cloudinaryReady) throw new Error("Image storage (Cloudinary) is not configured");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
      if (error) { console.error("Cloudinary upload failed:", error); reject(error); }
      else resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

export const uploadMany = (files = [], folder) => Promise.all(files.map((file) => uploadFile({ buffer: file.buffer, mimeType: file.mimetype, folder })));
