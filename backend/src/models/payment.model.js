import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

export const ORDER_STATUSES = ["Confirmed", "Shipped", "Delivered", "Cancelled"];

const orderItemSchema = new mongoose.Schema({
  tittle: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
  variantId: mongoose.Schema.Types.ObjectId,
  quantity: Number,
  images: [{ url: String }],
  category: String,
  variantName: String,
  sku: String,
  price: priceSchema,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  orderStatus: { type: String, enum: ORDER_STATUSES, default: "Confirmed" }
});
const paymentSchema = new mongoose.Schema({
  orderNumber: { type: String, index: true },
  status: { type: String, enum: ["pending","paid","failed"], default: "pending", index: true },
  orderStatus: { type: String, enum: ORDER_STATUSES, default: "Confirmed" },
  price: { type: priceSchema, required: true },
  razorpay: { orderId: String, paymentId: String, signature: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  shippingAddress: { fullName: String, phone: String, street: String, city: String, state: String, pincode: String },
  orderitems: [orderItemSchema],
  paidAt: Date,
  failureReason: String,
}, { timestamps: true });
paymentSchema.index({ "razorpay.orderId": 1 });
const paymentModel = mongoose.model("payment", paymentSchema);
export default paymentModel;
