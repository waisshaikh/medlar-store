import { useSelector, useDispatch } from "react-redux";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { closeCart, removeItem, updateItem } from "../../store/slices/cartSlice.js";
import { formatINR } from "../../utils/format.js";

export function CartLine({ item, compact }) {
  const dispatch = useDispatch();
  const atMax = item.stock !== null && item.quantity >= item.stock;
  const update = (qty) => {
    if (qty < 1) return;
    dispatch(updateItem({ itemId: item._id, quantity: qty })).unwrap().catch((m) => toast.error(m));
  };
  return (
    <div data-testid={`cart-item-${item._id}`} className="flex gap-4 p-3 rounded-sm bg-white border border-[#eee]">
      <div className={`${compact ? "w-20 h-20" : "w-24 h-24"} flex-shrink-0 rounded-sm overflow-hidden flex items-center justify-center p-2 bg-[#FAF7F2]`}>
        {item.image ? <img src={item.image} alt={item.product?.tittle} className="w-full h-full object-contain" /> : <ShoppingBag size={24} className="text-gray-300" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1a1a1a] truncate">{item.product?.tittle}</p>
        {item.variantLabel && <p data-testid={`cart-item-variant-${item._id}`} className="text-[11px] text-gray-500 mt-0.5">{item.variantLabel}</p>}
        <p className="text-xs font-semibold text-[#E8272A] mt-1">{formatINR(item.price?.amount)}</p>
        {item.stock !== null && item.stock < item.quantity && <p className="text-[10px] text-red-600 mt-1">Only {item.stock} in stock — reduce quantity</p>}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 border border-gray-200 rounded-sm">
            <button data-testid={`cart-item-decrease-${item._id}`} onClick={() => update(item.quantity - 1)} className="px-2 py-1 text-gray-500 hover:text-[#E8272A]"><Minus size={12} /></button>
            <span data-testid={`cart-item-qty-${item._id}`} className="text-xs font-medium w-4 text-center">{item.quantity}</span>
            <button data-testid={`cart-item-increase-${item._id}`} disabled={atMax} onClick={() => update(item.quantity + 1)} className="px-2 py-1 text-gray-500 hover:text-[#E8272A] disabled:opacity-30"><Plus size={12} /></button>
          </div>
          <button data-testid={`cart-item-remove-${item._id}`} onClick={() => dispatch(removeItem(item._id))} className="text-gray-400 hover:text-[#E8272A]"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isOpen, items, totalPrice } = useSelector((s) => s.cart);
  const { token } = useSelector((s) => s.auth);
  const close = () => dispatch(closeCart());
  const go = (path) => { close(); navigate(path); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={close} />
          <motion.div data-testid="cart-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-[#FAF7F2]">
            <div className="flex items-center justify-between px-6 py-5 bg-[#111]">
              <div className="flex items-center gap-2 text-white text-sm tracking-[0.15em] uppercase font-medium">
                <ShoppingBag size={18} /> <span data-testid="cart-drawer-count">Your Bag ({items.length})</span>
              </div>
              <button data-testid="cart-drawer-close-button" onClick={close} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <ShoppingBag size={48} className="text-gray-300" />
                  <p className="text-gray-500 text-sm">Your bag is empty</p>
                  <button data-testid="cart-drawer-shop-now-button" onClick={() => go("/shop")} className="text-xs tracking-widest uppercase text-white px-6 py-3 bg-[#E8272A] hover:opacity-80">SHOP NOW</button>
                </div>
              ) : items.map((item) => <CartLine key={item._id} item={item} compact />)}
            </div>
            {items.length > 0 && (
              <div className="px-6 py-5 space-y-3 border-t border-[#e0dbd4]">
                <div className="flex items-center justify-between"><span className="text-xs text-gray-600 tracking-wider uppercase">Shipping</span><span className="text-xs font-medium text-green-600">FREE</span></div>
                <div className="flex items-center justify-between pt-2 border-t border-[#e0dbd4]">
                  <span className="text-xs font-medium tracking-wider uppercase">Total</span>
                  <span data-testid="cart-drawer-total" className="text-base font-bold">{formatINR(totalPrice)}</span>
                </div>
                <button data-testid="cart-drawer-checkout-button" onClick={() => go(token ? "/checkout" : "/login")} className="w-full py-3.5 text-white text-xs tracking-[0.2em] uppercase font-medium bg-[#E8272A] hover:opacity-90">CHECKOUT</button>
                <button data-testid="cart-drawer-view-cart-button" onClick={() => go("/cart")} className="w-full py-3 text-[#1a1a1a] text-xs tracking-[0.15em] uppercase border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors">VIEW CART</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
