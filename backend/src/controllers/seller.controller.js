import mongoose from "mongoose";
import paymentModel, { ORDER_STATUSES } from "../models/payment.model.js";
import productModel from "../models/product.model.js";
import Usermodel from "../models/user.model.js";
import { restockOrderItems } from "../services/order.service.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Builds a createdAt range from ?month=YYYY-MM or ?from=YYYY-MM-DD&to=YYYY-MM-DD
const dateRange = ({ month, from, to }) => {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return { $gte: new Date(Date.UTC(y, m - 1, 1)), $lt: new Date(Date.UTC(y, m, 1)) };
  }
  const range = {};
  if (from) range.$gte = new Date(`${from}T00:00:00.000Z`);
  if (to) range.$lte = new Date(`${to}T23:59:59.999Z`);
  return Object.keys(range).length ? range : null;
};

const buildFilter = (query, defaultStatus) => {
  const filter = {};
  const status = query.paymentStatus ?? defaultStatus;
  if (status && status !== "all") filter.status = status;
  if (query.orderStatus && query.orderStatus !== "all") filter.orderStatus = query.orderStatus;
  const range = dateRange(query);
  if (range) filter.createdAt = range;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q.trim()), "i");
    filter.$or = [{ orderNumber: rx }, { "razorpay.orderId": rx }, { "razorpay.paymentId": rx }, { "shippingAddress.fullName": rx }, { "shippingAddress.phone": rx }, { "orderitems.tittle": rx }];
  }
  if (query.customer && mongoose.isValidObjectId(query.customer)) filter.user = query.customer;
  return filter;
};

export const getOrders = async (req, res) => {
  try {
    const filter = buildFilter(req.query, "paid");
    const orders = await paymentModel.find(filter).populate("user", "fullname email contact").sort({ createdAt: -1 }).limit(500);
    const revenue = orders.filter((o) => o.status === "paid" && o.orderStatus !== "Cancelled").reduce((s, o) => s + (o.price?.amount || 0), 0);
    const units = orders.reduce((s, o) => s + o.orderitems.reduce((a, i) => a + (i.quantity || 0), 0), 0);
    return res.json({ success: true, orders, summary: { count: orders.length, revenue, units } });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const csvCell = (v) => {
  const s = v === undefined || v === null ? "" : String(v);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

const CSV_HEADERS = ["Order number", "Date", "Time", "Customer", "Email", "Phone", "City", "State", "Pincode", "Product", "Variant", "SKU", "Quantity", "Unit price", "Line total", "Order total", "Currency", "Payment status", "Fulfilment", "Razorpay order ID", "Razorpay payment ID"];

// One row per line item, using the same filters as the orders list
export const exportOrders = async (req, res) => {
  try {
    const orders = await paymentModel.find(buildFilter(req.query, "paid")).populate("user", "fullname email contact").sort({ createdAt: -1 }).lean();
    const rows = [CSV_HEADERS];
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const base = {
        date: d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" }),
        time: d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
        name: o.shippingAddress?.fullName || o.user?.fullname, email: o.user?.email, phone: o.shippingAddress?.phone || o.user?.contact,
      };
      const items = o.orderitems?.length ? o.orderitems : [{}];
      items.forEach((i) => rows.push([
        o.orderNumber || String(o._id), base.date, base.time, base.name, base.email, base.phone,
        o.shippingAddress?.city, o.shippingAddress?.state, o.shippingAddress?.pincode,
        i.tittle, i.variantName, i.sku, i.quantity, i.price?.amount, (i.price?.amount || 0) * (i.quantity || 0),
        o.price?.amount, o.price?.currency || "INR", o.status, o.orderStatus, o.razorpay?.orderId, o.razorpay?.paymentId,
      ]));
    });
    const csv = "\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
    const label = req.query.month || [req.query.from, req.query.to].filter(Boolean).join("_to_") || "all-time";
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="medlar-orders-${label}.csv"`);
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) return res.status(404).json({ message: "Order not found" });
    const order = await paymentModel.findById(req.params.orderId).populate("user", "fullname email contact createdAt");
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (!ORDER_STATUSES.includes(orderStatus)) return res.status(400).json({ message: "Invalid order status" });
    const order = await paymentModel.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "paid") return res.status(400).json({ message: "Only paid orders can be updated" });
    if (order.orderStatus === "Cancelled") return res.status(400).json({ message: "Cancelled orders cannot be changed" });
    if (orderStatus === "Cancelled") await restockOrderItems(order.orderitems);
    order.orderStatus = orderStatus;
    order.orderitems.forEach((item) => { item.orderStatus = orderStatus; });
    await order.save();
    await order.populate("user", "fullname email contact");
    return res.json({ success: true, message: `Order marked ${orderStatus}`, order });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await paymentModel.find(buildFilter(req.query, "all")).populate("user", "fullname email").sort({ createdAt: -1 }).limit(500);
    const sum = (status) => payments.filter((p) => p.status === status).reduce((s, p) => s + (p.price?.amount || 0), 0);
    return res.json({ success: true, payments, summary: { count: payments.length, paid: sum("paid"), pending: sum("pending"), failed: sum("failed") } });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const match = { role: "buyer" };
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(req.query.q.trim()), "i");
      match.$or = [{ fullname: rx }, { email: rx }, { contact: rx }];
    }
    const customers = await Usermodel.aggregate([
      { $match: match },
      { $lookup: { from: "payments", let: { uid: "$_id" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$user", "$$uid"] }, { $eq: ["$status", "paid"] }, { $ne: ["$orderStatus", "Cancelled"] }] } } }, { $project: { amount: "$price.amount", createdAt: 1 } }], as: "orders" } },
      { $project: { fullname: 1, email: 1, contact: 1, createdAt: 1, ordersCount: { $size: "$orders" }, totalSpent: { $sum: "$orders.amount" }, lastOrderAt: { $max: "$orders.createdAt" } } },
      { $sort: { totalSpent: -1, createdAt: -1 } },
    ]);
    return res.json({ success: true, customers });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const monthKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    const [paid, pendingCount, failedCount, customersCount, products] = await Promise.all([
      paymentModel.find({ status: "paid" }).populate("user", "fullname email").sort({ createdAt: -1 }),
      paymentModel.countDocuments({ status: "pending" }),
      paymentModel.countDocuments({ status: "failed" }),
      Usermodel.countDocuments({ role: "buyer" }),
      productModel.find({ seller: req.user._id, archived: { $ne: true } }).lean(),
    ]);
    const live = paid.filter((o) => o.orderStatus !== "Cancelled");
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
      return { month: monthKey(d), revenue: 0, orders: 0 };
    });
    const byMonth = Object.fromEntries(months.map((m) => [m.month, m]));
    const statusBreakdown = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
    const productSales = {};
    paid.forEach((o) => {
      statusBreakdown[o.orderStatus || "Confirmed"] += 1;
      if (o.orderStatus === "Cancelled") return;
      const bucket = byMonth[monthKey(o.createdAt)];
      if (bucket) { bucket.revenue += o.price?.amount || 0; bucket.orders += 1; }
      o.orderitems.forEach((i) => {
        const key = i.productId?.toString();
        productSales[key] = productSales[key] || { productId: key, tittle: i.tittle, image: i.images?.[0]?.url, units: 0, revenue: 0 };
        productSales[key].units += i.quantity || 0;
        productSales[key].revenue += (i.price?.amount || 0) * (i.quantity || 0);
      });
    });
    const variants = products.flatMap((p) => p.variants.map((v) => ({ productId: p._id, tittle: p.tittle, variantId: v._id, label: v.name || Object.values(v.attributes || {}).join(" / ") || v.color, sku: v.sku, stock: v.stock, image: v.images?.[0]?.url || p.images?.[0] })));
    const thisMonth = byMonth[monthKey(now)] || { revenue: 0, orders: 0 };
    return res.json({
      success: true,
      stats: {
        totalRevenue: live.reduce((s, o) => s + (o.price?.amount || 0), 0),
        monthRevenue: thisMonth.revenue,
        monthOrders: thisMonth.orders,
        paidOrders: paid.length,
        pendingPayments: pendingCount,
        failedPayments: failedCount,
        customers: customersCount,
        products: products.length,
        variants: variants.length,
        unitsInStock: variants.reduce((s, v) => s + (v.stock || 0), 0),
      },
      monthly: months,
      statusBreakdown,
      lowStock: variants.filter((v) => v.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 8),
      topProducts: Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      recentOrders: paid.slice(0, 6),
    });
  } catch (error) {
    console.error("Overview error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
