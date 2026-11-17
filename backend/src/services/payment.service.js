import Razorpay from "razorpay";
import { config } from "../config/config.js";

const getRazorpayInstance = () => {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) throw new Error("Razorpay is not configured");
  return new Razorpay({ key_id: config.RAZORPAY_KEY_ID, key_secret: config.RAZORPAY_KEY_SECRET });
};

export const createOrder = async ({ amount, currency = "INR", receipt }) => {
  const razorpay = getRazorpayInstance();
  return razorpay.orders.create({ amount: Math.round(amount * 100), currency, receipt });
};
