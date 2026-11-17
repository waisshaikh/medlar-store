import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

export const MAX_VARIANT_IMAGES = 7;

const variantSchema = new mongoose.Schema({
  sku: { type: String, trim: true, uppercase: true },
  name: { type: String, trim: true },
  color: { type: String, trim: true },
  images: { type: [{ url: { type: String, required: true } }], validate: [(items) => items.length <= MAX_VARIANT_IMAGES, `A variant can have at most ${MAX_VARIANT_IMAGES} images`] },
  stock: { type: Number, default: 0, min: 0 },
  originalPrice: { type: priceSchema },
  active: { type: Boolean, default: true },
  attributes: { type: Map, of: String },
  price: { type: priceSchema, required: true }
});

const ProductSchema = new mongoose.Schema({
  tittle: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  category: { type: String, required: true, default: "Other", index: true },
  price: { type: priceSchema, required: true },
  images: { type: [{ type: String, required: true }], validate: [(items) => items.length <= MAX_VARIANT_IMAGES, `A product can have at most ${MAX_VARIANT_IMAGES} images`] },
  active: { type: Boolean, default: true, index: true },
  featured: { type: Boolean, default: false },
  archived: { type: Boolean, default: false, index: true },
  variants: [variantSchema]
}, { timestamps: true });

ProductSchema.index({ category: 1, active: 1 });
ProductSchema.index({ "variants.sku": 1 }, { sparse: true });
const productModel = mongoose.model("product", ProductSchema);
export default productModel;
