import crypto from "crypto";
import paymentModel from "../models/payment.model.js";
import { config } from "../config/config.js";
import { finalizePaidOrder } from "../services/order.service.js";

const safeEqual = (a = "", b = "") => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

export const verifyPaymentController = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }
    const expected = crypto.createHmac("sha256", config.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (!safeEqual(expected, razorpay_signature)) return res.status(400).json({ message: "Invalid payment signature" });

    const payment = await paymentModel.findOne({ "razorpay.orderId": razorpay_order_id, user: req.user._id });
    if (!payment) return res.status(404).json({ message: "Payment record not found" });

    const result = await finalizePaidOrder(payment, { paymentId: razorpay_payment_id, signature: razorpay_signature });
    if (result.status === "out_of_stock") return res.status(409).json({ message: "One or more selected variants went out of stock. Your payment will be refunded." });
    return res.status(200).json({ success: true, message: result.status === "paid" ? "Payment verified successfully" : "Payment already verified", payment: result.payment });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const razorpayWebhookController = async (req, res) => {
  try {
    if (!config.RAZORPAY_WEBHOOK_SECRET) return res.status(503).json({ message: "Webhook secret is not configured" });
    const signature = req.headers["x-razorpay-signature"];
    const expected = crypto.createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET).update(req.rawBody || Buffer.from("")).digest("hex");
    if (!signature || !safeEqual(signature, expected)) return res.status(400).json({ message: "Invalid webhook signature" });

    const { event, payload } = req.body || {};
    const entity = payload?.payment?.entity;
    const orderId = entity?.order_id || payload?.order?.entity?.id;
    if (orderId) {
      const payment = await paymentModel.findOne({ "razorpay.orderId": orderId });
      if (payment && (event === "payment.captured" || event === "order.paid")) {
        await finalizePaidOrder(payment, { paymentId: entity?.id });
      } else if (payment && event === "payment.failed") {
        await paymentModel.updateOne({ _id: payment._id, status: "pending" }, { $set: { status: "failed", failureReason: entity?.error_description || "Payment failed", "razorpay.paymentId": entity?.id } });
      }
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(400).json({ message: "Webhook rejected" });
  }
};

export const getPaymentByIdController = async (req, res) => {
  try {
    const payment = await paymentModel.findById(req.params.paymentId).populate("user", "fullname email");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== "seller") return res.status(403).json({ message: "Forbidden" });
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserPaymentsController = async (req, res) => {
  try {
    const payments = await paymentModel.find({ user: req.user._id, status: { $in: ["paid", "failed"] } }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, payments });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPaymentByOrderIdController = async (req, res) => {
  try {
    const payment = await paymentModel.findOne({ "razorpay.orderId": req.params.orderId, user: req.user._id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markPaymentFailedController = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    await paymentModel.updateOne({ "razorpay.orderId": orderId, user: req.user._id, status: "pending" }, { $set: { status: "failed", failureReason: reason || "Payment failed" } });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
