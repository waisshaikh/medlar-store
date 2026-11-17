import api from "./api.js";
const multipart = { headers: { "Content-Type": "multipart/form-data" } };
export const getCategories = () => api.get("/categories");
export const getSellerCategories = () => api.get("/categories/seller/all");
export const createCategory = (formData) => api.post("/categories", formData, multipart);
export const updateCategory = (id, formData) => api.put(`/categories/${id}`, formData, multipart);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
