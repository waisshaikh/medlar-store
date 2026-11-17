import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { getSellerPayments } from "../../services/seller.api.js";
import { PageHeader, Panel, StatCard, StatusBadge, Spinner, EmptyState } from "../../components/Seller/ui.jsx";
import DateFilters, { toParams, currentMonth } from "../../components/Seller/DateFilters.jsx";
import { formatINR, fmtDate } from "../../utils/format.js";

const OPTIONS = [["all", "All payments"], ["paid", "Paid"], ["pending", "Pending"], ["failed", "Failed"]];

export default function Payments() {
  const [filters, setFilters] = useState({ mode: "all", month: currentMonth(), from: "", to: "", paymentStatus: "all", q: "" });
  const [data, setData] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      getSellerPayments(toParams(filters)).then((res) => setData(res.data)).catch(() => toast.error("Failed to load payments"));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  return (
    <div data-testid="seller-payments-page">
      <PageHeader eyebrow="Finance" title="Payments" subtitle="Every Razorpay checkout attempt, verified on the server. Issue refunds from your Razorpay dashboard." />
      {data && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
          <StatCard dark testid="payments-summary-paid" label="Collected" value={formatINR(data.summary.paid)} />
          <StatCard testid="payments-summary-pending" label="Pending" value={formatINR(data.summary.pending)} />
          <StatCard testid="payments-summary-failed" label="Failed" value={formatINR(data.summary.failed)} />
        </div>
      )}
      <Panel>
        <DateFilters prefix="payments" filters={filters} setFilters={setFilters} statusOptions={OPTIONS} />
        {!data ? <Spinner /> : data.payments.length === 0 ? <EmptyState icon={CreditCard} title="No payments match these filters" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="payments-table">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 border-b border-neutral-100">
                  <th className="px-5 py-3">Date</th><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Razorpay IDs</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.payments.map((p) => (
                  <tr key={p._id} data-testid={`payment-row-${p._id}`}>
                    <td className="px-5 py-3 whitespace-nowrap text-neutral-600">{fmtDate(p.createdAt, true)}</td>
                    <td className="px-5 py-3 font-mono text-xs">{p.orderNumber || "—"}</td>
                    <td className="px-5 py-3"><p className="font-medium">{p.user?.fullname}</p><p className="text-[11px] text-neutral-500">{p.user?.email}</p></td>
                    <td className="px-5 py-3 font-mono text-[11px] text-neutral-600"><p>{p.razorpay?.orderId}</p><p>{p.razorpay?.paymentId || "—"}</p></td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} />{p.failureReason && <p className="text-[11px] text-red-600 mt-1 max-w-[200px]">{p.failureReason}</p>}</td>
                    <td className="px-5 py-3 text-right font-semibold">{formatINR(p.price?.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
