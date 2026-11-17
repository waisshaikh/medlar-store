import { Router } from "express";
import multer from "multer";
import { listCategories, listAllCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { authenticateSeller } from "../middlewares/auth.middleware.js";

const router = Router();
const image = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }).single("image");

router.get("/", listCategories);
router.get("/seller/all", authenticateSeller, listAllCategories);
router.post("/", authenticateSeller, image, createCategory);
router.put("/:categoryId", authenticateSeller, image, updateCategory);
router.delete("/:categoryId", authenticateSeller, deleteCategory);

export default router;
