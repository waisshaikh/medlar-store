import api from "./api.js";
export const getCart = () => api.get("/cart");
export const addToCart = (productId, variantId, quantity) => {
  const url = variantId ? `/cart/${productId}/${variantId}` : `/cart/${productId}`;
  return api.post(url, { quantity });
};
export const updateCartItem = (itemId, quantity) => api.patch(`/cart/${itemId}`, { quantity });
export const removeCartItem = (itemId) => api.delete(`/cart/${itemId}`);
export const clearCart = () => api.delete("/cart");
export const createRazorpayOrder = (shippingAddress) => api.post("/cart/create-order", { shippingAddress });
