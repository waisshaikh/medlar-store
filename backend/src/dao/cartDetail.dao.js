import cartModel from "../models/cart.model.js";

export const variantLabel = (variant) => variant ? (variant.name || Object.values(variant.attributes || {}).join(" / ") || variant.color || "") : "";

export async function getCartDetails(userId) {
  const cart = await cartModel.findOne({ user: userId }).populate("items.product").lean();
  if (!cart) return [];
  const items = cart.items.filter((item) => item.product && (!item.variant || item.product.variants.some((v) => v._id.toString() === item.variant.toString()))).map((item) => {
    const product = item.product;
    const variant = item.variant ? product.variants.find((v) => v._id.toString() === item.variant.toString()) || null : null;
    return {
      _id: item._id,
      quantity: item.quantity,
      price: variant?.price || product.price,
      variant,
      variantLabel: variantLabel(variant),
      stock: variant ? variant.stock : null,
      image: variant?.images?.[0]?.url || product.images?.[0] || "",
      product: { _id: product._id, tittle: product.tittle, category: product.category, images: product.images, seller: product.seller, active: product.active },
    };
  });
  const totalPrice = items.reduce((sum, item) => sum + (item.price?.amount || 0) * (item.quantity || 1), 0);
  const currency = items[0]?.price?.currency || "INR";
  return [{ _id: cart._id, user: cart.user, items, totalPrice, currency }];
}
