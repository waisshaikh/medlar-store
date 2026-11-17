import api from "./api.js";
export const verifyPayment = (data) => api.post("/payment/verify", data);
export const getUserPayments = () => api.get("/payment/my-orders");
