import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingBag, X, Download } from "lucide-react";
import toast from "react-hot-toast";
import { getSellerOrders, exportSellerOrders } from "../../services/seller.api.js";
import { PageHeader, Panel, StatCard, StatusBadge, Spinner, EmptyState, inputCls, btnDark } from "../../components/Seller/ui.jsx";
import DateFilters, { toParams, currentMonth } from "../../components/Seller/DateFilters.jsx";
import OrderDetail from "../../components/Seller/OrderDetail.jsx";
import { formatINR, fmtDate } from "../../utils/format.js";

const PAYMENT_OPTIONS = [["paid", "Paid orders"], ["pending", "Awaiting payment"], ["failed", "Failed"], ["all", "All payment states"]];
const ORDER_STATUSES = ["Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function SellerOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customer = searchParams.get("customer") || "";
  const [filters, setFilters] = useState({ mode: "all", month: currentMonth(), from: "", to: "", paymentStatus: customer ? "all" : "paid", orderStatus: "", q: "", customer });
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);

  const downloadCsv = async () => {
    setExporting(true);
    try {
      const res = await exportSellerOrders(toParams(filters));
      const name = res.headers["content-disposition"]?.match(/filename="(.+)"/)?.[1] || "medlar-orders.csv";
      const url = URL.createObjectURL(res.data);
      const a = Object.assign(document.createElement("a"), { href: url, download: name });
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Orders downloaded");
    } catch {
      toast.error("Could not export orders");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      getSellerOrders(toParams(filters)).then((res) => setData(res.data)).catch(() => toast.error("Failed to load orders"));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const onUpdated = (order) => {
    setSelected(order);
    setData((d) => ({ ...d, orders: d.orders.map((o) => (o._id === order._id ? order : o)) }));
  };

  const clearCustomer = () => { setSearchParams({}); setFilters({ ...filters, customer: "" }); };

  const statusSelect = (
    <select data-testid="orders-fulfilment-filter" value={filters.orderStatus} onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })} className={`${inputCls} xl:w-44`}>
      <option value="">All fulfilment</option>
      {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );

  return (
    <div data-testid="seller-orders-page">
      <PageHeader eyebrow="Sales" title="Orders" subtitle="Filter by month or exact dates, then open an order for full details and fulfilment."
        actions={<button data-testid="orders-export-csv-button" onClick={downloadCsv} disabled={exporting || !data?.orders?.length} className={btnDark}><Download size={14} /> {exporting ? "Preparing…" : "Download CSV"}</button>} />
      {data && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
          <StatCard dark testid="orders-summary-revenue" label="Revenue" value={formatINR(data.summary.revenue)} />
          <StatCard testid="orders-summary-count" label="Orders" value={data.summary.count} />
          <StatCard testid="orders-summary-units" label="Units" value={data.summary.units} />
        </div>
      )}
      {filters.customer && (
        <button data-testid="orders-clear-customer" onClick={clearCustomer} className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#111] text-white">Filtered to one customer <X size={12} /></button>
      )}
      <Panel>
        <DateFilters prefix="orders" filters={filters} setFilters={setFilters} statusOptions={PAYMENT_OPTIONS} extra={statusSelect} />
        {!data ? <Spinner /> : data.orders.length === 0 ? <EmptyState icon={ShoppingBag} title="No orders match these filters" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="orders-table">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 border-b border-neutral-100">
                  <th className="px-5 py-3">Order</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Payment</th><th className="px-5 py-3">Fulfilment</th><th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.orders.map((o) => (
                  <tr key={o._id} data-testid={`order-row-${o._id}`} onClick={() => setSelected(o)} className="hover:bg-neutral-50 cursor-pointer">
                    <td className="px-5 py-3 font-mono text-xs whitespace-nowrap">{o.orderNumber || o._id.slice(-8)}</td>
                    <td className="px-5 py-3 text-neutral-600 whitespace-nowrap">{fmtDate(o.createdAt, true)}</td>
                    <td className="px-5 py-3"><p className="font-medium">{o.shippingAddress?.fullName || o.user?.fullname}</p><p className="text-[11px] text-neutral-500">{o.shippingAddress?.city}</p></td>
                    <td className="px-5 py-3 text-neutral-600 max-w-[220px] truncate">{o.orderitems.map((i) => `${i.tittle}${i.variantName ? ` (${i.variantName})` : ""} ×${i.quantity}`).join(", ")}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3"><StatusBadge status={o.orderStatus} /></td>
                    <td className="px-5 py-3 text-right font-semibold whitespace-nowrap">{formatINR(o.price?.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <OrderDetail order={selected} onClose={() => setSelected(null)} onUpdated={onUpdated} />
    </div>
  );
}
