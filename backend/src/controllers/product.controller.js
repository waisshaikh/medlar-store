import multer from "multer";
import productModel, { MAX_VARIANT_IMAGES } from "../models/product.model.js";
import categoryModel from "../models/category.model.js";
import { uploadMany } from "../services/storage.service.js";

export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: MAX_VARIANT_IMAGES } });

const parseJSON = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};
const toBool = (value, fallback) => (value === undefined || value === "" ? fallback : value === true || value === "true");
const hasValue = (value) => value !== undefined && value !== null && value !== "";

const loadOwnedProduct = async (req, res) => {
  const product = await productModel.findById(req.params.productId);
  if (!product || product.archived) { res.status(404).json({ message: "Product not found" }); return null; }
  if (product.seller.toString() !== req.user._id.toString()) { res.status(403).json({ message: "Forbidden: You do not own this product" }); return null; }
  return product;
};

const ensureCategory = async (name) => Boolean(name && await categoryModel.exists({ name }));

const ensureUniqueSku = async (sku, variantId) => {
  if (!sku) return true;
  const clash = await productModel.findOne({ variants: { $elemMatch: { sku: sku.toUpperCase(), ...(variantId && { _id: { $ne: variantId } }) } } });
  return !clash;
};

const handleError = (res, label, error) => {
  console.error(`${label} error:`, error);
  if (error.http_code) return res.status(502).json({ message: error.http_code === 403 || error.http_code === 401 ? "Image upload failed: your Cloudinary key doesn't have upload permission" : "Image upload failed, please try again" });
  const status = error.name === "ValidationError" || /not configured|Only image/.test(error.message) ? 400 : 500;
  return res.status(status).json({ message: error.message || "Server error" });
};

export const createProduct = async (req, res) => {
  try {
    const { tittle, description, priceAmount, priceCurrency, category } = req.body;
    if (!(await ensureCategory(category))) return res.status(400).json({ message: "Please choose a valid category" });
    if (!req.files?.length) return res.status(400).json({ message: "At least one image is required" });

    const images = await uploadMany(req.files);
    const product = await productModel.create({
      tittle, description, seller: req.user._id, category,
      price: { amount: Number(priceAmount), currency: priceCurrency || "INR" },
      images,
      active: toBool(req.body.active, true),
      featured: toBool(req.body.featured, false),
    });
    return res.status(201).json({ message: "Product created successfully", success: true, product });
  } catch (error) {
    return handleError(res, "Create product", error);
  }
};

export const getSellerProduct = async (req, res) => {
  try {
    const products = await productModel.find({ seller: req.user._id, archived: { $ne: true } }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return handleError(res, "Get seller products", error);
  }
};

export const getSellerProductDetail = async (req, res) => {
  try {
    const product = await loadOwnedProduct(req, res);
    if (product) return res.status(200).json({ success: true, product });
  } catch (error) {
    return handleError(res, "Get seller product", error);
  }
};

const publicView = (product) => {
  const obj = product.toObject ? product.toObject() : product;
  return { ...obj, variants: (obj.variants || []).filter((v) => v.active !== false) };
};

export const getAllProduct = async (req, res) => {
  try {
    const query = { active: { $ne: false }, archived: { $ne: true } };
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === "true") query.featured = true;
    if (req.query.q) query.tittle = { $regex: req.query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const products = await productModel.find(query).sort({ featured: -1, createdAt: -1 }).populate("seller", "fullname");
    return res.status(200).json({ success: true, products: products.map(publicView) });
  } catch (error) {
    return handleError(res, "Get all products", error);
  }
};

export const getProductDetail = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.productId).populate("seller", "fullname");
    if (!product || product.active === false) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ success: true, product: publicView(product) });
  } catch (error) {
    return res.status(404).json({ message: "Product not found" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await loadOwnedProduct(req, res);
    if (!product) return;
    const { tittle, description, priceAmount, priceCurrency, category } = req.body;

    if (hasValue(category) && category !== product.category && !(await ensureCategory(category))) {
      return res.status(400).json({ message: "Please choose a valid category" });
    }
    const keep = parseJSON(req.body.keepImages, null);
    const kept = Array.isArray(keep) ? product.images.filter((url) => keep.includes(url)) : product.images;
    if (kept.length + (req.files?.length || 0) > MAX_VARIANT_IMAGES) return res.status(400).json({ message: `A product can have at most ${MAX_VARIANT_IMAGES} images` });
    const uploaded = await uploadMany(req.files || []);
    const images = [...kept, ...uploaded];
    if (!images.length) return res.status(400).json({ message: "At least one image is required" });

    if (hasValue(tittle)) product.tittle = tittle;
    if (hasValue(description)) product.description = description;
    if (hasValue(category)) product.category = category;
    if (hasValue(priceAmount)) product.price.amount = Number(priceAmount);
    if (hasValue(priceCurrency)) product.price.currency = priceCurrency;
    product.active = toBool(req.body.active, product.active);
    product.featured = toBool(req.body.featured, product.featured);
    product.images = images;

    await product.save();
    return res.status(200).json({ message: "Product updated successfully", success: true, product });
  } catch (error) {
    return handleError(res, "Update product", error);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await loadOwnedProduct(req, res);
    if (!product) return;
    product.archived = true;
    product.active = false;
    await product.save();
    return res.status(200).json({ message: "Product removed from catalog", success: true });
  } catch (error) {
    return handleError(res, "Delete product", error);
  }
};

const applyVariantFields = (variant, body) => {
  const currency = body.priceCurrency || variant.price?.currency || "INR";
  if (hasValue(body.name)) variant.name = body.name;
  if (hasValue(body.color)) variant.color = body.color;
  if (body.sku !== undefined) variant.sku = body.sku || undefined;
  if (hasValue(body.priceAmount)) variant.price = { amount: Number(body.priceAmount), currency };
  if (body.originalPriceAmount !== undefined) variant.originalPrice = hasValue(body.originalPriceAmount) ? { amount: Number(body.originalPriceAmount), currency } : undefined;
  if (hasValue(body.stock)) variant.stock = Math.max(0, Math.floor(Number(body.stock)));
  variant.active = toBool(body.active, variant.active ?? true);
  const attributes = parseJSON(body.attributes, null);
  if (attributes && typeof attributes === "object") variant.attributes = attributes;
};

export const addProductVarient = async (req, res) => {
  try {
    const product = await loadOwnedProduct(req, res);
    if (!product) return;
    if (!hasValue(req.body.priceAmount) || Number(req.body.priceAmount) <= 0) return res.status(400).json({ message: "Variant price is required" });
    if (!req.files?.length) return res.status(400).json({ message: "Each variant needs at least one image" });
    if (!(await ensureUniqueSku(req.body.sku))) return res.status(400).json({ message: "SKU already exists" });

    const images = (await uploadMany(req.files)).map((url) => ({ url }));
    const variant = { images, stock: 0, active: true, price: { amount: 0, currency: "INR" } };
    applyVariantFields(variant, req.body);
    product.variants.push(variant);
    await product.save();
    return res.status(201).json({ message: "Variant added successfully", success: true, product });
  } catch (error) {
    return handleError(res, "Add variant", error);
  }
};

export const updateVariant = async (req, res) => {
  try {
    const product = await loadOwnedProduct(req, res);
    if (!product) return;
    const variant = product.variants.id(req.params.variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });
    if (req.body.sku && !(await ensureUniqueSku(req.body.sku, variant._id))) return res.status(400).json({ message: "SKU already exists" });

    const keep = parseJSON(req.body.keepImages, null);
    const kept = Array.isArray(keep) ? variant.images.filter((img) => keep.includes(img.url)) : variant.images;
    if (kept.length + (req.files?.length || 0) > MAX_VARIANT_IMAGES) return res.status(400).json({ message: `A variant can have at most ${MAX_VARIANT_IMAGES} images` });
    const uploaded = (await uploadMany(req.files || [])).map((url) => ({ url }));
    const images = [...kept.map((img) => ({ url: img.url })), ...uploaded];
    if (!images.length) return res.status(400).json({ message: "Each variant needs at least one image" });

    variant.images = images;
    applyVariantFields(variant, req.body);
    await product.save();
    return res.status(200).json({ message: "Variant updated successfully", success: true, product });
  } catch (error) {
    return handleError(res, "Update variant", error);
  }
};

export const updateVariantStock = async (req, res) => {
  try {
    const stock = Number(req.body.stock);
    if (!Number.isFinite(stock) || stock < 0) return res.status(400).json({ message: "Stock must be 0 or more" });
    const product = await loadOwnedProduct(req, res);
    if (!product) return;
    const variant = product.variants.id(req.params.variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });
    variant.stock = Math.floor(stock);
    await product.save();
    return res.status(200).json({ message: "Variant stock updated", success: true, variant, product });
  } catch (error) {
    return handleError(res, "Update variant stock", error);
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const product = await loadOwnedProduct(req, res);
    if (!product) return;
    product.variants = product.variants.filter((v) => v._id.toString() !== req.params.variantId);
    await product.save();
    return res.status(200).json({ message: "Variant deleted successfully", success: true, product });
  } catch (error) {
    return handleError(res, "Delete variant", error);
  }
};
