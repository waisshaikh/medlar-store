import { useState } from "react";
import toast from "react-hot-toast";
import { updateSellerOrderStatus } from "../../services/seller.api.js";
import { Modal, StatusBadge, btnGhost, btnDark } from "./ui.jsx";
import { formatINR, fmtDate, apiError } from "../../utils/format.js";

const NEXT = { Confirmed: ["Shipped", "Cancelled"], Shipped: ["Delivered", "Cancelled"], Delivered: [], Cancelled: [] };

function Row({ label, value, mono }) {
  return <div className="flex justify-between gap-4 py-1.5 text-sm"><span className="text-neutral-500">{label}</span><span className={`text-right ${mono ? "font-mono text-xs" : "font-medium"}`}>{value || "—"}</span></div>;
}

export default function OrderDetail({ order, onClose, onUpdated }) {
  const [saving, setSaving] = useState(null);
  if (!order) return null;
  const a = order.shippingAddress || {};

  const setStatus = async (status) => {
    if (status === "Cancelled" && !window.confirm("Cancel this order? Stock will be returned to inventory. Refunds are issued from your Razorpay dashboard.")) return;
    setSaving(status);
    try {
      const { data } = await updateSellerOrderStatus(order._id, status);
      toast.success(data.message);
      onUpdated(data.order);
    } catch (err) { toast.error(apiError(err, "Failed to update")); }
    finally { setSaving(null); }
  };

  return (
    <Modal open onClose={onClose} wide title={`Order ${order.orderNumber || order._id.slice(-8)}`} testid="order-detail-modal">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <StatusBadge status={order.status} testid="order-detail-payment-status" />
        <StatusBadge status={order.orderStatus} testid="order-detail-order-status" />
        <span className="text-xs text-neutral-500 ml-auto">Placed {fmtDate(order.createdAt, true)}</span>
      </div>
      <ul className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl mb-5">
        {order.orderitems.map((i) => (
          <li key={i._id} className="flex items-center gap-3 p-3">
            <img src={i.images?.[0]?.url || "/catalog/catogery/backPack.png"} alt="" className="w-14 h-14 rounded-lg object-contain bg-[#F7F5F1] p-1" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{i.tittle}</p>
              <p className="text-xs text-neutral-500">{i.variantName || "Standard"} · SKU {i.sku || "—"} · {i.category}</p>
            </div>
            <div className="text-right text-sm"><p>{i.quantity} × {formatINR(i.price?.amount)}</p><p className="font-semibold">{formatINR((i.price?.amount || 0) * i.quantity)}</p></div>
          </li>
        ))}
        <li className="flex justify-between p-3 font-heading font-bold"><span>Total</span><span data-testid="order-detail-total">{formatINR(order.price?.amount)}</span></li>
      </ul>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-500 mb-2">Customer & delivery</p>
          <Row label="Customer" value={order.user?.fullname} />
          <Row label="Email" value={order.user?.email} />
          <Row label="Phone" value={a.phone} />
          <p className="text-sm mt-2 leading-relaxed bg-[#F7F5F1] rounded-xl p-3">{a.fullName}<br />{a.street}<br />{a.city}, {a.state} – {a.pincode}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-500 mb-2">Payment</p>
          <Row label="Razorpay order" value={order.razorpay?.orderId} mono />
          <Row label="Razorpay payment" value={order.razorpay?.paymentId} mono />
          <Row label="Paid at" value={fmtDate(order.paidAt, true)} />
          {order.failureReason && <Row label="Note" value={order.failureReason} />}
        </div>
      </div>
      {order.status === "paid" && NEXT[order.orderStatus]?.length > 0 && (
        <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-neutral-100">
          {NEXT[order.orderStatus].map((s) => (
            <button key={s} data-testid={`order-status-${s.toLowerCase()}-button`} disabled={Boolean(saving)} onClick={() => setStatus(s)} className={s === "Cancelled" ? `${btnGhost} hover:!border-red-500 hover:text-red-600` : btnDark}>
              {saving === s ? "Updating…" : `Mark ${s}`}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
