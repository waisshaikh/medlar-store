import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Truck, RotateCcw, Shield, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { fetchProductDetail, fetchProducts } from "../../store/slices/productSlice.js";
import { addItem, openCart } from "../../store/slices/cartSlice.js";
import { useWishlist } from "../../hooks/useWishlist.js";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import LoadingSpinner from "../../components/ui/LoadingSpinner.jsx";
import { formatINR, variantLabel, activeVariants, firstAvailableVariant } from "../../utils/format.js";

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e0dbd4" }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex justify-between items-center py-4 text-sm font-medium text-[#1a1a1a] text-left tracking-wider uppercase">
        {title}{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-4 text-sm text-gray-600 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Gallery({ images, title }) {
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(0), [images]);
  const current = images[selected] || images[0];
  return (
    <div>
      <div className="rounded-sm overflow-hidden mb-3 flex items-center justify-center p-6 bg-white" style={{ aspectRatio: "1", border: "1px solid #e0dbd4" }}>
        {current ? <motion.img key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={current} alt={title} data-testid="product-main-image" className="w-full h-full object-contain" /> : <ShoppingBag size={80} className="text-gray-200" />}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, i) => (
            <button key={url + i} data-testid={`product-image-thumbnail-${i}`} onClick={() => setSelected(i)}
              className={`w-16 h-16 rounded-sm overflow-hidden flex items-center justify-center p-1 bg-[#FAF7F2] transition-all ${selected === i ? "border-2 border-[#E8272A]" : "border border-[#e0dbd4] hover:border-[#999]"}`}>
              <img src={url} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VariantPicker({ variants, selected, onSelect }) {
  if (!variants.length) return null;
  return (
    <div className="mb-6">
      <p className="text-xs font-medium tracking-[0.15em] uppercase text-[#1a1a1a] mb-3">
        Option: <span className="text-neutral-500 normal-case tracking-normal">{variantLabel(selected)}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSel = selected?._id === v._id;
          const out = v.stock === 0;
          return (
            <button key={v._id} data-testid={`product-variant-${v._id}`} onClick={() => onSelect(v)}
              className={`flex items-center gap-2 pl-1 pr-3 py-1 text-xs tracking-wider border rounded-sm transition-all ${isSel ? "bg-[#111] text-white border-[#111]" : "text-[#1a1a1a] border-[#ddd] hover:border-[#111]"} ${out ? "opacity-60" : ""}`}>
              <img src={v.images?.[0]?.url} alt="" className="w-8 h-8 object-contain bg-white rounded-sm" />
              <span className={out ? "line-through" : ""}>{variantLabel(v)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, list: related, detailLoading } = useSelector((s) => s.products);
  const { token } = useSelector((s) => s.auth);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { active: wishlisted, toggle: toggleWishlist } = useWishlist(id);

  useEffect(() => { dispatch(fetchProductDetail(id)); window.scrollTo(0, 0); }, [id, dispatch]);

  const loadedId = product?._id === id ? id : null;
  const category = product?.category;
  useEffect(() => {
    if (!loadedId) return;
    dispatch(fetchProducts({ category }));
    setQuantity(1);
  }, [loadedId, category, dispatch]);

  // Keep the shopper's pick across refetches; only fall back when it no longer exists
  useEffect(() => {
    if (!product || product._id !== id) return;
    setSelectedVariant((cur) => activeVariants(product).find((v) => v._id === cur?._id) || firstAvailableVariant(product));
  }, [product, id]);

  if (detailLoading || (product && product._id !== id)) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4" data-testid="product-not-found">
      <p className="font-heading text-2xl font-bold">Product not found</p>
      <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-[#E52B32]">Back to shop</Link>
    </div>
  );

  const variants = activeVariants(product);
  const images = selectedVariant?.images?.length ? selectedVariant.images.map((i) => i.url) : product.images || [];
  const price = selectedVariant?.price?.amount ?? product.price?.amount ?? 0;
  const mrp = selectedVariant?.originalPrice?.amount;
  const stock = selectedVariant ? selectedVariant.stock : variants.length ? 0 : 99;

  const selectVariant = (v) => { setSelectedVariant(v); setQuantity(1); };

  const handleAddToCart = async () => {
    if (!token) { toast.error("Please sign in"); navigate("/login"); return; }
    setAdding(true);
    try {
      await dispatch(addItem({ productId: product._id, variantId: selectedVariant?._id || null, quantity })).unwrap();
      toast.success("Added to your bag!");
      dispatch(openCart());
    } catch (err) { toast.error(err || "Failed to add"); }
    finally { setAdding(false); }
  };

  const relatedProducts = related.filter((p) => p._id !== product._id).slice(0, 4);

  return (
    <div className="bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 tracking-wider uppercase">
          <Link to="/" className="hover:text-[#E8272A]">Home</Link><span>/</span>
          <Link to="/shop" className="hover:text-[#E8272A]">Shop</Link><span>/</span>
          <span className="text-[#1a1a1a] truncate">{product.tittle}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Gallery images={images} title={product.tittle} />
          <div>
            <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase mb-2" data-testid="product-sku">
              {product.category} · SKU {selectedVariant?.sku || product._id.slice(-8).toUpperCase()}
            </p>
            <h1 data-testid="product-title" className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{product.tittle}</h1>
            <div className="mb-6 flex items-baseline gap-3">
              <span data-testid="product-price" className="text-3xl font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>{formatINR(price)}</span>
              {mrp > price && <span className="text-sm text-neutral-400 line-through">{formatINR(mrp)}</span>}
              {mrp > price && <span className="text-xs font-bold text-[#E52B32]">{Math.round((1 - price / mrp) * 100)}% OFF</span>}
            </div>

            <VariantPicker variants={variants} selected={selectedVariant} onSelect={selectVariant} />

            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-medium tracking-[0.15em] uppercase text-[#1a1a1a]">Qty</span>
              <div className="flex items-center border border-[#ddd] rounded-sm">
                <button data-testid="product-quantity-decrease-button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 text-gray-500 hover:text-[#E8272A]">−</button>
                <span data-testid="product-quantity-value" className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button data-testid="product-quantity-increase-button" disabled={quantity >= stock} onClick={() => setQuantity((q) => Math.min(stock, q + 1))} className="w-10 h-10 text-gray-500 hover:text-[#E8272A] disabled:opacity-30">+</button>
              </div>
              <span data-testid="product-stock-status" className={`text-xs font-medium ${stock === 0 ? "text-red-600" : stock <= 5 ? "text-orange-500" : "text-green-600"}`}>
                {stock === 0 ? "Out of stock" : stock <= 5 ? `Only ${stock} left` : "In stock · ships in 24 hours"}
              </span>
            </div>

            <div className="flex gap-3 mb-8">
              <button data-testid="product-add-to-cart-button" onClick={handleAddToCart} disabled={adding || stock === 0}
                className="flex-1 py-4 bg-[#111] text-white text-xs tracking-[0.2em] uppercase font-medium disabled:opacity-50 hover:bg-[#E52B32] transition-colors flex items-center justify-center gap-2">
                {adding ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShoppingBag size={14} />{stock === 0 ? "OUT OF STOCK" : "ADD TO BAG"}</>}
              </button>
              <button data-testid="product-add-to-wishlist-button" onClick={toggleWishlist}
                className={`w-14 h-14 flex items-center justify-center border transition-all rounded-sm ${wishlisted ? "border-[#E8272A] text-[#E8272A]" : "border-[#ddd] text-gray-400 hover:border-[#E8272A] hover:text-[#E8272A]"}`}>
                <Heart size={18} className={wishlisted ? "fill-[#E8272A]" : ""} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[[Truck, "Free Shipping", "On all orders"], [RotateCcw, "15-Day Returns", "Hassle-free"], [Shield, "2-Year Warranty", "On all bags"]].map(([Icon, label, sub]) => (
                <div key={label} className="flex flex-col items-center text-center p-3 rounded-sm bg-white" style={{ border: "1px solid #e0dbd4" }}>
                  <Icon size={16} className="text-[#E8272A] mb-1" />
                  <p className="text-[9px] font-medium tracking-wider uppercase text-[#1a1a1a]">{label}</p>
                  <p className="text-[9px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #e0dbd4" }}>
              <AccordionItem title="Description"><p>{product.description}</p></AccordionItem>
              <AccordionItem title="Specifications">
                <ul className="space-y-1">
                  <li>Category: {product.category}</li>
                  {Object.entries(selectedVariant?.attributes || {}).map(([k, v]) => <li key={k} className="capitalize">{k}: {v}</li>)}
                  {variants.length > 0 && <li>Available options: {variants.length}</li>}
                </ul>
              </AccordionItem>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
