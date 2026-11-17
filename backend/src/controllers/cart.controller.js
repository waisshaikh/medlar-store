import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import paymentModel from "../models/payment.model.js";
import { getCartDetails, variantLabel } from "../dao/cartDetail.dao.js";
import { createOrder } from "../services/payment.service.js";
import { config } from "../config/config.js";

const isRealId = (id) => id && !["main", "undefined", "null"].includes(id);
const activeVariants = (product) => product.variants.filter((v) => v.active !== false);

const respondWithCart = async (res, userId, message) => {
  const cartDetails = await getCartDetails(userId);
  return res.status(200).json({ success: true, message, cart: cartDetails[0] || null });
};

export const cartController = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const quantity = Math.max(1, Number(req.body.quantity) || 1);
    const userId = req.user._id;

    const product = await productModel.findById(productId);
    if (!product || product.active === false) return res.status(404).json({ message: "Product not found" });

    let variant = null;
    if (isRealId(variantId)) {
      variant = product.variants.id(variantId);
      if (!variant || variant.active === false) return res.status(404).json({ message: "Variant not found" });
    } else if (activeVariants(product).length) {
      return res.status(400).json({ message: "Please select a variant" });
    }

    let cart = await cartModel.findOne({ user: userId });
    if (!cart) cart = new cartModel({ user: userId, items: [] });

    const existing = cart.items.find((item) => item.product.toString() === productId
      && (variant ? item.variant?.toString() === variant._id.toString() : !item.variant));
    const nextQty = (existing?.quantity || 0) + quantity;
    if (variant && nextQty > variant.stock) {
      return res.status(400).json({ message: variant.stock ? `Only ${variant.stock} left in stock for this variant` : "This variant is out of stock" });
    }

    const price = variant ? variant.price : product.price;
    if (existing) { existing.quantity = nextQty; existing.price = price; }
    else cart.items.push({ product: productId, variant: variant?._id || null, quantity, price });

    await cart.save();
    return respondWithCart(res, userId, "Item added to cart");
  } catch (error) {
    console.error("Cart error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCartController = async (req, res) => {
  try {
    return respondWithCart(res, req.user._id);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCartItemController = async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!quantity || quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

    const cart = await cartModel.findOne({ user: req.user._id });
    const item = cart?.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    if (item.variant) {
      const product = await productModel.findById(item.product);
      const variant = product?.variants.id(item.variant);
      if (!variant) return res.status(404).json({ message: "Variant no longer available" });
      if (quantity > variant.stock) return res.status(400).json({ message: `Only ${variant.stock} left in stock for this variant` });
    }

    item.quantity = quantity;
    await cart.save();
    return respondWithCart(res, req.user._id, "Cart item updated");
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeCartItemController = async (req, res) => {
  try {
    await cartModel.updateOne({ user: req.user._id }, { $pull: { items: { _id: req.params.itemId } } });
    return respondWithCart(res, req.user._id, "Item removed from cart");
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const clearCartController = async (req, res) => {
  try {
    await cartModel.updateOne({ user: req.user._id }, { $set: { items: [] } });
    return res.status(200).json({ message: "Cart cleared successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const ADDRESS_FIELDS = ["fullName", "phone", "street", "city", "state", "pincode"];
const makeOrderNumber = () => `MDL-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const createOrderController = async (req, res) => {
  try {
    const userId = req.user._id;
    const shippingAddress = req.body.shippingAddress || {};
    const missing = ADDRESS_FIELDS.filter((f) => !String(shippingAddress[f] || "").trim());
    if (missing.length) return res.status(400).json({ message: `Missing shipping fields: ${missing.join(", ")}` });
    if (!/^\d{10}$/.test(String(shippingAddress.phone).replace(/\D/g, "").slice(-10))) return res.status(400).json({ message: "Enter a valid 10-digit phone number" });
    if (!/^\d{6}$/.test(String(shippingAddress.pincode).trim())) return res.status(400).json({ message: "Enter a valid 6-digit PIN code" });

    const [cart] = await getCartDetails(userId);
    if (!cart?.items?.length) return res.status(400).json({ message: "Cart is empty" });

    for (const item of cart.items) {
      if (item.product.active === false) return res.status(400).json({ message: `${item.product.tittle} is no longer available` });
      if (item.variant && (item.variant.active === false || item.quantity > item.variant.stock)) {
        return res.status(400).json({ message: `${item.product.tittle} (${item.variantLabel}) has only ${item.variant.stock} in stock` });
      }
    }

    const razorpayOrder = await createOrder({ amount: cart.totalPrice, currency: cart.currency, receipt: makeOrderNumber() });
    const payment = await paymentModel.create({
      orderNumber: razorpayOrder.receipt,
      status: "pending",
      price: { amount: cart.totalPrice, currency: cart.currency },
      razorpay: { orderId: razorpayOrder.id },
      user: userId,
      shippingAddress: Object.fromEntries(ADDRESS_FIELDS.map((f) => [f, String(shippingAddress[f]).trim()])),
      orderitems: cart.items.map((item) => ({
        tittle: item.product.tittle,
        productId: item.product._id,
        variantId: item.variant?._id || null,
        quantity: item.quantity,
        images: item.image ? [{ url: item.image }] : [],
        category: item.product.category,
        variantName: item.variantLabel,
        sku: item.variant?.sku,
        price: item.price,
        seller: item.product.seller,
      })),
    });

    return res.status(201).json({
      success: true,
      message: "Order created",
      keyId: config.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id,
      orderNumber: payment.orderNumber,
    });
  } catch (error) {
    console.error("Create order error:", error);
    const authFailed = error?.statusCode === 401 || /Authentication failed/i.test(error?.error?.description || "");
    const message = error.message === "Razorpay is not configured" || authFailed ? "Payment service is unavailable right now. Please try again shortly." : "Could not start payment, please try again";
    return res.status(503).json({ message });
  }
};

export { variantLabel };
