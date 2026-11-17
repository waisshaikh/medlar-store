import { Router } from "express";
import {
  createProduct,
  getSellerProduct,
  getSellerProductDetail,
  getAllProduct,
  getProductDetail,
  updateProduct,
  deleteProduct,
  addProductVarient,
  updateVariant,
  updateVariantStock,
  deleteVariant,
  upload,
} from "../controllers/product.controller.js";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import { productValidator } from "../validator/product.validator.js";

const router = Router();
const images = upload.array("images", 7);

// Seller queries
router.get("/seller", authenticateSeller, getSellerProduct);
router.get("/seller/all", authenticateSeller, getSellerProduct);
router.get("/seller/product/:productId", authenticateSeller, getSellerProductDetail);

// Public
router.get("/product/:productId", getProductDetail);
router.get("/", getAllProduct);
router.get("/:productId", getProductDetail);

// Seller mutations
router.post("/", authenticateSeller, images, productValidator, createProduct);
router.put("/seller/product/:productId", authenticateSeller, images, updateProduct);
router.delete("/seller/product/:productId", authenticateSeller, deleteProduct);

// Variants
router.post("/seller/product/:productId/variants", authenticateSeller, images, addProductVarient);
router.put("/seller/product/:productId/variants/:variantId", authenticateSeller, images, updateVariant);
router.patch("/seller/product/:productId/variants/:variantId/stock", authenticateSeller, updateVariantStock);
router.delete("/seller/product/:productId/variants/:variantId", authenticateSeller, deleteVariant);

export default router;
