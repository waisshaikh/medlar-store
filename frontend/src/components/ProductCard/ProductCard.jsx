import { Link, useNavigate } from "react-router-dom";
import { Star, Heart, ArrowUpRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addItem, openCart } from "../../store/slices/cartSlice.js";
import { useWishlist } from "../../hooks/useWishlist.js";
import { formatINR, productImage, startingPrice, firstAvailableVariant, productStock, activeVariants } from "../../utils/format.js";

export default function ProductCard({ product, darkTheme = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);
  const { active: wishlisted, toggle } = useWishlist(product._id);
  const soldOut = activeVariants(product).length > 0 && productStock(product) === 0;
  const title = product.tittle || "Medlar Bag";

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) { toast.error("Please sign in to add to bag"); navigate("/login"); return; }
    const variant = firstAvailableVariant(product);
    try {
      await dispatch(addItem({ productId: product._id, variantId: variant?._id, quantity: 1 })).unwrap();
      toast.success("Added to your bag");
      dispatch(openCart());
    } catch (msg) { toast.error(msg || "Could not add to bag"); }
  };

  return (
    <Link
      to={`/product/${product._id}`}
      data-testid={`product-card-${product._id}`}
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-lg transition-all duration-300 ${darkTheme ? "bg-[#181818] border border-white/10 hover:border-white/25" : "bg-white border border-neutral-200 hover:border-neutral-300"}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden p-4 sm:p-5 bg-[#F7F5F1]">
        {(product.featured || soldOut) && (
          <span className={`absolute left-3 top-3 z-10 px-2 py-1 text-[9px] font-semibold tracking-wider text-white ${soldOut ? "bg-neutral-500" : "bg-[#111]"}`}>
            {soldOut ? "SOLD OUT" : "BESTSELLER"}
          </span>
        )}
        <button
          onClick={toggle}
          data-testid={`product-card-wishlist-${product._id}`}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-neutral-700 shadow-sm transition-colors hover:text-[#E52B32]"
        >
          <Heart size={16} className={wishlisted ? "fill-[#E52B32] text-[#E52B32]" : ""} />
        </button>
        <img src={productImage(product)} alt={title} loading="lazy" className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]" />
        {!soldOut && (
          <button
            onClick={handleAddToCart}
            data-testid={`product-card-quick-add-${product._id}`}
            className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-[#111] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#E52B32]"
          >
            Quick Add <ArrowUpRight size={13} />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <h3 className={`min-h-[2.8rem] line-clamp-2 text-[14px] sm:text-base font-semibold leading-snug transition-colors group-hover:text-[#E52B32] ${darkTheme ? "text-white" : "text-[#111]"}`}>{title}</h3>
          <p className={`mt-1 text-xs ${darkTheme ? "text-neutral-400" : "text-neutral-500"}`}>
            {product.category}{activeVariants(product).length > 1 ? ` · ${activeVariants(product).length} options` : ""}
          </p>
        </div>
        <div className={`flex items-center justify-between gap-2 border-t pt-3 ${darkTheme ? "border-white/10" : "border-neutral-100"}`}>
          <span data-testid={`product-card-price-${product._id}`} className={`text-base sm:text-lg font-bold ${darkTheme ? "text-white" : "text-[#111]"}`}>
            {activeVariants(product).length > 1 && <span className="text-[10px] font-normal text-neutral-500 mr-1">FROM</span>}
            {formatINR(startingPrice(product))}
          </span>
          <div className="flex shrink-0 items-center gap-1 text-xs">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className={darkTheme ? "text-neutral-200" : "text-neutral-800"}>4.8</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
