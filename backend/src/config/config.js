import dotenv from "dotenv";
dotenv.config();

export const config = {
  MONGODB_URI: process.env.MONGODB_URI || `${process.env.MONGO_URL}/${process.env.DB_NAME}`,
  JWT_SECRET: process.env.JWT_SECRET,
  Client_ID: process.env.GOOGLE_CLIENT_ID || "",
  Client_secret: process.env.GOOGLE_CLIENT_SECRET || "",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  SELLER_EMAILS: (process.env.SELLER_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean),

  // Seed accounts
  SEED_SELLER_PASSWORD: process.env.SEED_SELLER_PASSWORD || "",
  SEED_BUYER_EMAIL: process.env.SEED_BUYER_EMAIL || "",
  SEED_BUYER_PASSWORD: process.env.SEED_BUYER_PASSWORD || "",

  // Origins
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  BACKEND_ORIGIN: process.env.BACKEND_ORIGIN || "http://localhost:3000",
};
