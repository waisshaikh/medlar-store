import categoryModel, { slugify } from "../models/category.model.js";
import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

const withCounts = async (categories, activeOnly) => {
  const match = activeOnly ? { active: { $ne: false }, archived: { $ne: true } } : { archived: { $ne: true } };
  const counts = await productModel.aggregate([{ $match: match }, { $group: { _id: "$category", count: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  return categories.map((c) => ({ ...c, productCount: map[c.name] || 0 }));
};

const resolveImage = async (req) => {
  if (req.file) return uploadFile({ buffer: req.file.buffer, mimeType: req.file.mimetype, folder: "medlar_categories" });
  return req.body.image;
};

export const listCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean();
    return res.json({ success: true, categories: await withCounts(categories, true) });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const listAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find().sort({ sortOrder: 1, name: 1 }).lean();
    return res.json({ success: true, categories: await withCounts(categories, false) });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const storageError = (res, error) => error.http_code
  ? res.status(502).json({ message: "Image upload failed: your Cloudinary key doesn't have upload permission" })
  : res.status(400).json({ message: error.message });

export const createCategory = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ message: "Category name is required" });
    const slug = slugify(req.body.slug || name);
    if (await categoryModel.exists({ $or: [{ name }, { slug }] })) return res.status(400).json({ message: "A category with this name already exists" });
    const category = await categoryModel.create({
      name, slug,
      description: req.body.description || "",
      image: (await resolveImage(req)) || "",
      featured: req.body.featured === "true" || req.body.featured === true,
      active: req.body.active !== "false" && req.body.active !== false,
      sortOrder: Number(req.body.sortOrder) || 0,
    });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return storageError(res, error);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });
    const oldName = category.name;
    const name = req.body.name?.trim();
    if (name && name !== oldName) {
      if (await categoryModel.exists({ name, _id: { $ne: category._id } })) return res.status(400).json({ message: "A category with this name already exists" });
      category.name = name;
      if (req.body.slug) category.slug = slugify(req.body.slug);
    }
    if (req.body.description !== undefined) category.description = req.body.description;
    const image = await resolveImage(req);
    if (image !== undefined) category.image = image;
    if (req.body.featured !== undefined) category.featured = req.body.featured === "true" || req.body.featured === true;
    if (req.body.active !== undefined) category.active = req.body.active === "true" || req.body.active === true;
    if (req.body.sortOrder !== undefined) category.sortOrder = Number(req.body.sortOrder) || 0;
    await category.save();
    if (category.name !== oldName) await productModel.updateMany({ category: oldName }, { $set: { category: category.name } });
    return res.json({ success: true, category });
  } catch (error) {
    return storageError(res, error);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });
    const inUse = await productModel.countDocuments({ category: category.name, archived: { $ne: true } });
    if (inUse) return res.status(409).json({ message: `Move or delete the ${inUse} product(s) in this category first` });
    await category.deleteOne();
    return res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
