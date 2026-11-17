import categoryModel, { slugify } from "../models/category.model.js";
import productModel from "../models/product.model.js";
import Usermodel from "../models/user.model.js";
import { config } from "../config/config.js";

const CATEGORIES = [
  ["Backpacks", "/catalog/catogery/backPack.png", "Everyday carry and laptop backpacks", true],
  ["Laptop & Office Bags", "/catalog/catogery/laptop office bag.png", "Structured bags for the workday", true],
  ["Messenger Bags", "/catalog/catogery/messanger bag.png", "Cross-body carry for city commutes", false],
  ["Sling Bags", "/catalog/catogery/sling bag.png", "Light, quick-access slings", false],
  ["Duffel Bags", "/catalog/catogery/duffle.png", "Weekenders and gym duffels", true],
  ["Trekking Bags", "/catalog/catogery/trekking.png", "Built for the trail", false],
  ["Pouches", "/catalog/catogery/multipurpose pouch.png", "Organisers and travel pouches", false],
  ["Waist Bags", "/catalog/catogery/Chest waist bag.png", "Hands-free chest and waist carry", false],
];

const variant = (sku, name, color, price, stock, image, attributes, original) => ({
  sku, name, color, stock, images: [{ url: image }], attributes,
  price: { amount: price, currency: "INR" },
  ...(original && { originalPrice: { amount: original, currency: "INR" } }),
});

const BS = "/catalog/Best seller";
const CAT = "/catalog/catogery";
const PRODUCTS = [
  { tittle: "Full Expandable Messenger Bag", category: "Messenger Bags", price: 3035, image: `${BS}/Full Expandable Messenger Bag.png`, featured: true,
    description: "Structured messenger bag in water-resistant vegan leather with an expandable gusset and a padded laptop compartment.",
    variants: [["MDL-MSG-BLK", "Jet Black", "Black", 3035, 15, { color: "Jet Black", capacity: "18L" }, 3999], ["MDL-MSG-TAN", "Cognac Tan", "Tan", 3235, 6, { color: "Cognac Tan", capacity: "18L" }, 4199]] },
  { tittle: "Premium Laptop Backpack", category: "Backpacks", price: 2285, image: `${BS}/Premium Laptop Backpack.png`, featured: true,
    description: "Ergonomic 24L laptop backpack with breathable back padding, trolley strap and weather-shielded zips.",
    variants: [["MDL-BPK-ONX", "Onyx Black 24L", "Black", 2285, 20, { color: "Onyx Black", size: "24L" }, 2999], ["MDL-BPK-GRY", "Graphite Grey 24L", "Grey", 2385, 4, { color: "Graphite Grey", size: "24L" }]] },
  { tittle: "Croco Duffle Bag with Side Pocket", category: "Duffel Bags", price: 2085, image: `${BS}/Croco Duffle Bag with Side Pocket.png`, featured: true,
    description: "Signature duffel in embossed croc-grain leather with a detachable padded strap and a shoe compartment.",
    variants: [["MDL-DUF-MAH", "Deep Mahogany 35L", "Brown", 2085, 10, { color: "Deep Mahogany", size: "35L" }, 2799], ["MDL-DUF-BLK", "Midnight Black 35L", "Black", 2185, 0, { color: "Midnight Black", size: "35L" }]] },
  { tittle: "Large Shoulder Bag with Handle", category: "Sling Bags", price: 999, image: `${BS}/Large Shoulder Bag with Handle.png`, featured: true,
    description: "Dual-tone shoulder bag for daily commutes with twin top handles, a vertical zip pocket and a tablet sleeve.",
    variants: [["MDL-SHB-DUO", "Dual Tone", "Black/Grey", 999, 25, { color: "Dual Tone" }, 1499]] },
  { tittle: "Executive Laptop Office Bag", category: "Laptop & Office Bags", price: 2799, image: `${CAT}/laptop office bag.png`,
    description: "Slim executive bag with a 15.6\" padded sleeve, document divider and luggage pass-through.",
    variants: [["MDL-OFC-BLK", "Classic Black", "Black", 2799, 12, { color: "Classic Black" }]] },
  { tittle: "Summit Trekking Rucksack", category: "Trekking Bags", price: 3499, image: `${CAT}/trekking.png`,
    description: "45L trekking rucksack with load-lifter straps, rain cover and a ventilated back panel.",
    variants: [["MDL-TRK-45", "Forest 45L", "Green", 3499, 8, { color: "Forest", size: "45L" }], ["MDL-TRK-60", "Forest 60L", "Green", 3999, 3, { color: "Forest", size: "60L" }]] },
  { tittle: "Multipurpose Travel Pouch", category: "Pouches", price: 499, image: `${CAT}/multipurpose pouch.png`,
    description: "Water-resistant organiser pouch for cables, toiletries and travel documents.",
    variants: [["MDL-PCH-BLK", "Black", "Black", 499, 40, { color: "Black" }]] },
  { tittle: "Chest & Waist Bag", category: "Waist Bags", price: 899, image: `${CAT}/Chest waist bag.png`,
    description: "Convertible chest and waist bag with an anti-theft back pocket and quick-release buckle.",
    variants: [["MDL-WST-BLK", "Stealth Black", "Black", 899, 18, { color: "Stealth Black" }]] },
];

const ensureUser = async ({ email, password, fullname, contact, role }) => {
  if (!email || !password) return null;
  const existing = await Usermodel.findOne({ email });
  if (existing) {
    if (existing.role !== role) { existing.role = role; await existing.save(); }
    return existing;
  }
  return Usermodel.create({ email, password, fullname, contact, role });
};

export async function seedDatabase() {
  if (!(await categoryModel.estimatedDocumentCount())) {
    await categoryModel.insertMany(CATEGORIES.map(([name, image, description, featured], i) => ({ name, slug: slugify(name), image, description, featured, sortOrder: i })));
    console.log("Seeded categories");
  }

  const [sellerEmail] = config.SELLER_EMAILS;
  const seller = await ensureUser({ email: sellerEmail, password: config.SEED_SELLER_PASSWORD, fullname: "Medlar Seller", contact: "9000000001", role: "seller" });
  await ensureUser({ email: config.SEED_BUYER_EMAIL?.toLowerCase(), password: config.SEED_BUYER_PASSWORD, fullname: "Test Buyer", contact: "9000000002", role: "buyer" });
  // Users whose email is no longer authorised lose seller access
  await Usermodel.updateMany({ role: "seller", email: { $nin: config.SELLER_EMAILS } }, { $set: { role: "buyer" } });

  if (seller && !(await productModel.estimatedDocumentCount())) {
    await productModel.insertMany(PRODUCTS.map((p) => ({
      tittle: p.tittle, description: p.description, category: p.category, featured: Boolean(p.featured),
      seller: seller._id, price: { amount: p.price, currency: "INR" }, images: [p.image],
      variants: p.variants.map(([sku, name, color, price, stock, attributes, original]) => variant(sku, name, color, price, stock, p.image, attributes, original)),
    })));
    console.log("Seeded products");
  }
}
