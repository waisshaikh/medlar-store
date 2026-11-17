import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { ShieldCheck, Lock, Truck, CreditCard } from "lucide-react";
import { fetchCart, resetCart } from "../../store/slices/cartSlice.js";
import { verifyPayment } from "../../services/payment.api.js";
import { createRazorpayOrder } from "../../services/cart.api.js";
import { formatINR, loadRazorpay, apiError } from "../../utils/format.js";

const FIELDS = [
  ["fullName", "Full name", "text", "John Doe", 2],
  ["phone", "Phone (10 digits)", "tel", "9876543210", 2],
  ["street", "Street address", "text", "Flat, building, street", 2],
  ["city", "City", "text", "Mumbai", 1],
  ["state", "State", "text", "Maharashtra", 1],
  ["pincode", "PIN code", "text", "400001", 2],
];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullname || "", phone: user?.contact || "", street: "", city: "", state: "", pincode: "" });

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);
  useEffect(() => { if (user) setForm((f) => ({ ...f, fullName: f.fullName || user.fullname, phone: f.phone || user.contact || "" })); }, [user]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!items.length) { toast.error("Your bag is empty"); navigate("/shop"); return; }
    setLoading(true);
    try {
      const [{ data: order }, ready] = await Promise.all([createRazorpayOrder(form), loadRazorpay()]);
      if (!ready) throw new Error("Could not load Razorpay. Check your connection.");
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "MEDLAR",
        description: `Order ${order.orderNumber}`,
        order_id: order.orderId,
        prefill: { name: form.fullName, email: user?.email || "", contact: form.phone },
        theme: { color: "#E52B32" },
        handler: async (response) => {
          try {
            await verifyPayment(response);
            dispatch(resetCart());
            toast.success("Payment successful! Your order is placed.");
            navigate("/account?placed=1");
          } catch (err) { toast.error(apiError(err, "Payment verification failed")); }
        },
        modal: { ondismiss: () => { setLoading(false); toast("Payment window closed"); } },
      });
      rzp.on("payment.failed", (r) => toast.error(r.error?.description || "Payment failed"));
      rzp.open();
    } catch (err) {
      toast.error(apiError(err, err.message || "Failed to start checkout"));
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="checkout-page">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-heading font-bold text-3xl text-[#111] mb-2 tracking-tight">Checkout</h1>
        <p className="text-neutral-500 mb-8 text-sm">Enter your delivery details to complete your order.</p>
        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8">
              <h2 className="font-heading font-bold text-lg text-[#111] mb-6 flex items-center gap-2"><Truck className="text-[#E52B32]" size={20} /> Shipping address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map(([name, label, type, placeholder, span]) => (
                  <div key={name} className={span === 2 ? "sm:col-span-2" : ""}>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-500 mb-1.5">{label} *</label>
                    <input data-testid={`checkout-${name === "fullName" ? "full-name" : name}-input`} type={type} name={name} required value={form[name]} placeholder={placeholder}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#111] text-sm" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="text-[#E52B32]" size={22} />
                <div><p className="font-bold text-sm">Razorpay secure checkout</p><p className="text-xs text-neutral-400">Cards, UPI, netbanking & wallets</p></div>
              </div>
              <ShieldCheck className="text-green-600" size={22} />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6 h-fit lg:sticky lg:top-24">
            <h2 className="font-heading font-bold text-lg mb-5">Your order</h2>
            <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item._id} className="py-3 flex items-center gap-3">
                  <img src={item.image} alt="" className="w-12 h-12 object-contain bg-[#FAF7F2] rounded p-1 border border-neutral-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.product?.tittle}</p>
                    <p className="text-[11px] text-neutral-400">{item.variantLabel} · Qty {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold">{formatINR((item.price?.amount || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm py-2 border-t border-neutral-100"><span className="text-neutral-500">Shipping</span><span className="text-green-600">FREE</span></div>
            <div className="flex justify-between items-center py-3 mb-4"><span className="font-bold">Total</span><span data-testid="checkout-total" className="font-heading font-bold text-2xl text-[#E52B32]">{formatINR(totalPrice)}</span></div>
            <button data-testid="checkout-pay-button" type="submit" disabled={loading || !items.length}
              className="w-full bg-[#E52B32] hover:bg-[#c92027] text-white py-4 rounded-xl font-bold tracking-wider uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Lock size={16} /> Pay {formatINR(totalPrice)}</>}
            </button>
            <p className="text-[10px] text-neutral-400 text-center mt-3">Test mode — use Razorpay test cards or UPI success@razorpay</p>
          </div>
        </form>
      </div>
    </div>
  );
}
