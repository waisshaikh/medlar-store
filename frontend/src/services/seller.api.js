import api from "./api.js";
export const getOverview = () => api.get("/seller/overview");
export const getSellerOrders = (params) => api.get("/seller/orders", { params });
export const getSellerOrder = (id) => api.get(`/seller/orders/${id}`);
export const updateSellerOrderStatus = (id, orderStatus) => api.patch(`/seller/orders/${id}/status`, { orderStatus });
export const getSellerPayments = (params) => api.get("/seller/payments", { params });
export const getSellerCustomers = (params) => api.get("/seller/customers", { params });
export const exportSellerOrders = (params) => api.get("/seller/orders/export", { params, responseType: "blob" });
