import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { clearCart } from "../../store/slices/cartSlice.js";
import { CartLine } from "../../components/CartDrawer/CartDrawer.jsx";
import { formatINR } from "../../utils/format.js";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice } = useSelector((s) => s.cart);
  const { token } = useSelector((s) => s.auth);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="cart-page">
      <div className="max-w-6xl mx-auto">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#111] mb-3"><ArrowLeft size={14} /> Continue shopping</Link>
        <h1 className="font-heading font-bold text-3xl text-[#111] mb-8">Your bag</h1>
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
            <ShoppingBag size={44} className="mx-auto text-neutral-300 mb-4" />
            <p className="font-heading font-semibold text-lg mb-5">Your bag is empty</p>
            <Link to="/shop" data-testid="cart-page-shop-button" className="inline-block px-6 py-3 bg-[#111] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E52B32]">Explore the shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => <CartLine key={item._id} item={item} />)}
              <button data-testid="cart-page-clear-button" onClick={() => dispatch(clearCart())} className="text-xs font-semibold text-neutral-500 hover:text-[#E52B32]">Clear bag</button>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 h-fit lg:sticky lg:top-24">
              <h2 className="font-heading font-bold text-lg mb-4">Summary</h2>
              <div className="flex justify-between text-sm py-2"><span className="text-neutral-500">Subtotal</span><span>{formatINR(totalPrice)}</span></div>
              <div className="flex justify-between text-sm py-2"><span className="text-neutral-500">Shipping</span><span className="text-green-600">FREE</span></div>
              <div className="flex justify-between font-heading font-bold text-lg py-3 border-t border-neutral-100 mt-2"><span>Total</span><span data-testid="cart-page-total">{formatINR(totalPrice)}</span></div>
              <button data-testid="cart-page-checkout-button" onClick={() => navigate(token ? "/checkout" : "/login")} className="w-full mt-4 py-3.5 bg-[#E52B32] hover:bg-[#c92027] text-white text-xs font-bold uppercase tracking-[0.2em]">Checkout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
