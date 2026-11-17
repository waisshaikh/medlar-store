import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Package, Heart, LogOut, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { getUserPayments } from "../../services/payment.api.js";
import { logout } from "../../store/slices/authSlice.js";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import { formatINR, fmtDate } from "../../utils/format.js";

const BADGE = { paid: "bg-green-100 text-green-700", failed: "bg-red-100 text-red-700", pending: "bg-yellow-100 text-yellow-700" };

function OrderCard({ order }) {
  const a = order.shippingAddress || {};
  return (
    <div data-testid={`customer-order-${order._id}`} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex flex-wrap justify-between items-center gap-4 text-xs">
        <div className="flex gap-6">
          <div><span className="text-neutral-400 block uppercase tracking-wider text-[10px]">Order</span><span className="font-mono font-bold">{order.orderNumber || order._id.slice(-8)}</span></div>
          <div><span className="text-neutral-400 block uppercase tracking-wider text-[10px]">Placed</span><span className="font-semibold">{fmtDate(order.createdAt)}</span></div>
          <div><span className="text-neutral-400 block uppercase tracking-wider text-[10px]">Total</span><span className="font-bold text-[#E52B32]">{formatINR(order.price?.amount)}</span></div>
        </div>
        <div className="flex gap-2">
          <span className={`px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${BADGE[order.status]}`}>{order.status}</span>
          {order.status === "paid" && <span className="px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider bg-neutral-200 text-neutral-700">{order.orderStatus}</span>}
        </div>
      </div>
      <div className="p-6 divide-y divide-neutral-100">
        {order.orderitems?.map((item) => (
          <div key={item._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={item.images?.[0]?.url} alt="" className="w-16 h-16 bg-[#FAF7F2] rounded-lg p-1.5 object-contain border border-neutral-100" />
              <div><p className="font-semibold text-sm">{item.tittle}</p><p className="text-xs text-neutral-400">{item.variantName} · Qty {item.quantity}</p></div>
            </div>
            <p className="font-semibold text-sm">{formatINR((item.price?.amount || 0) * item.quantity)}</p>
          </div>
        ))}
      </div>
      {order.status === "failed" && order.failureReason && <p className="px-6 pb-4 text-xs text-red-600">{order.failureReason}</p>}
      {a.street && <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-100 text-xs text-neutral-500"><span className="font-semibold text-neutral-700">Delivering to: </span>{a.fullName}, {a.street}, {a.city}, {a.state} – {a.pincode}</div>}
    </div>
  );
}

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "wishlist" ? "wishlist" : "orders";
  const { user } = useSelector((s) => s.auth);
  const wishlist = useSelector((s) => s.wishlist.items);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getUserPayments().then((res) => setOrders(res.data.payments || [])).catch(() => { setOrders([]); toast.error("Failed to load your orders"); });
  }, []);

  const handleLogout = async () => { await dispatch(logout()); navigate("/login"); };
  const tabCls = (t) => `flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${tab === t ? "bg-[#111] text-white" : "bg-white border border-neutral-200 text-neutral-600"}`;

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="customer-dashboard">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#111] text-white flex items-center justify-center font-heading text-xl font-bold">{user?.fullname?.charAt(0) || "U"}</div>
            <div><h1 className="text-2xl font-heading font-bold">{user?.fullname}</h1><p className="text-sm text-neutral-500">{user?.email}</p></div>
          </div>
          <div className="flex gap-3">
            {user?.role === "seller" && <Link to="/seller" data-testid="account-seller-portal-button" className="px-4 py-2 bg-[#E52B32] text-white text-sm font-semibold rounded-lg">Seller hub</Link>}
            <button data-testid="account-logout-button" onClick={handleLogout} className="px-4 py-2 border border-neutral-200 text-sm font-semibold rounded-lg flex items-center gap-2"><LogOut size={16} /> Logout</button>
          </div>
        </div>
        {params.get("placed") && (
          <div data-testid="order-placed-banner" className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-4 text-sm"><CheckCircle2 size={18} /> Thank you! Your payment was verified and your order is confirmed.</div>
        )}
        <div className="flex gap-2 mb-6">
          <button data-testid="account-tab-orders" onClick={() => setParams({})} className={tabCls("orders")}><Package size={14} /> Orders</button>
          <button data-testid="account-tab-wishlist" onClick={() => setParams({ tab: "wishlist" })} className={tabCls("wishlist")}><Heart size={14} /> Wishlist ({wishlist.length})</button>
        </div>
        {tab === "orders" ? (
          orders === null ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#E52B32] border-t-transparent rounded-full animate-spin" /></div>
          : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
              <Package size={44} className="mx-auto text-neutral-300 mb-4" />
              <p className="font-heading font-semibold text-lg mb-5">No orders yet</p>
              <Link to="/shop" className="bg-[#111] text-white px-6 py-2.5 rounded-lg text-sm font-semibold">Explore shop</Link>
            </div>
          ) : <div className="space-y-5">{orders.map((o) => <OrderCard key={o._id} order={o} />)}</div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200" data-testid="wishlist-empty">
            <Heart size={44} className="mx-auto text-neutral-300 mb-4" />
            <p className="font-heading font-semibold text-lg">Nothing saved yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" data-testid="wishlist-grid">{wishlist.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}
