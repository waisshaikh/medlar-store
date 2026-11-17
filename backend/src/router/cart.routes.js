import { Router } from "express";
import {
  cartController,
  getCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
  createOrderController,
} from "../controllers/cart.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { validateAddToCart } from "../validator/Cart.validator.js";

const router = Router();

router.use(authenticateUser);

// Razorpay order creation (before /:productId)
router.post("/payment/create/order", createOrderController);
router.post("/create-order", createOrderController);

router.get("/", getCartController);
router.delete("/", clearCartController);
router.delete("/clear", clearCartController);

// Add to cart with or without variant
router.post("/:productId", validateAddToCart, cartController);
router.post("/:productId/:variantId", validateAddToCart, cartController);
router.post("/add/:productId", validateAddToCart, cartController);
router.post("/add/:productId/:variantId", validateAddToCart, cartController);

// Update / Remove items
router.patch("/:itemId", updateCartItemController);
router.patch("/item/:itemId", updateCartItemController);
router.delete("/:itemId", removeCartItemController);
router.delete("/item/:itemId", removeCartItemController);


export default router;
