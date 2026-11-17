import mongoose from "mongoose";

export const slugify = (value = "") => value.toString().toLowerCase().trim().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  featured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const categoryModel = mongoose.model("category", categorySchema);
export default categoryModel;
