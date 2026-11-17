import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { getOverview } from "../../services/seller.api.js";
import { PageHeader, Panel, StatCard, StatusBadge, Spinner, EmptyState } from "../../components/Seller/ui.jsx";
import { formatINR, fmtDate } from "../../utils/format.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function RevenueChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="px-5 pb-5 pt-6">
      <div className="flex items-end gap-1.5 sm:gap-3 h-48" data-testid="overview-revenue-chart">
        {data.map((d, i) => {
          const last = i === data.length - 1;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full group">
              <span className="text-[9px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 mb-1 whitespace-nowrap">{formatINR(d.revenue)}</span>
              <div className={`w-full rounded-t-md transition-all ${last ? "bg-[#E52B32]" : "bg-[#111] group-hover:bg-[#E52B32]/70"}`} style={{ height: `${Math.max(3, (d.revenue / max) * 100)}%` }} />
              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 mt-2">{MONTHS[Number(d.month.slice(5)) - 1]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LowStock({ items }) {
  if (!items.length) return <EmptyState title="All variants are well stocked" />;
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((v) => (
        <li key={v.variantId} className="flex items-center gap-3 px-5 py-3">
          <img src={v.image} alt="" className="w-10 h-10 rounded-lg object-contain bg-[#F7F5F1] p-1" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{v.tittle}</p>
            <p className="text-[11px] text-neutral-500 truncate">{v.label} · {v.sku || "No SKU"}</p>
          </div>
          <span className={`text-xs font-bold ${v.stock === 0 ? "text-red-600" : "text-amber-600"}`}>{v.stock === 0 ? "Sold out" : `${v.stock} left`}</span>
          <Link to={`/seller/products/${v.productId}/edit`} className="text-neutral-400 hover:text-[#E52B32]"><ArrowRight size={14} /></Link>
        </li>
      ))}
    </ul>
  );
}

export default function Overview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getOverview().then((res) => setData(res.data)).catch(() => toast.error("Failed to load overview"));
  }, []);

  if (!data) return <Spinner />;
  const { stats, monthly, statusBreakdown, lowStock, topProducts, recentOrders } = data;

  return (
    <div data-testid="seller-overview-page">
      <PageHeader eyebrow="Overview" title="Store performance" subtitle="Revenue counts paid orders and excludes cancellations." />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard dark testid="overview-total-revenue" label="Total revenue" value={formatINR(stats.totalRevenue)} hint={`${stats.paidOrders} paid orders`} />
        <StatCard testid="overview-month-revenue" label="This month" value={formatINR(stats.monthRevenue)} hint={`${stats.monthOrders} orders`} />
        <StatCard testid="overview-customers" label="Customers" value={stats.customers} hint={`${stats.pendingPayments} pending · ${stats.failedPayments} failed payments`} />
        <StatCard testid="overview-inventory" label="Inventory" value={stats.unitsInStock} hint={`${stats.products} products · ${stats.variants} variants`} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Panel title="Revenue · last 12 months" className="xl:col-span-2"><RevenueChart data={monthly} /></Panel>
        <Panel title="Order status">
          <ul className="p-5 space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between"><StatusBadge status={status} /><span className="font-heading font-bold">{count}</span></li>
            ))}
          </ul>
        </Panel>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title="Recent orders" className="xl:col-span-2" action={<Link to="/seller/orders" className="text-[11px] font-bold uppercase text-[#E52B32]">View all</Link>}>
          {recentOrders.length === 0 ? <EmptyState title="No paid orders yet" text="Orders appear here once a customer completes payment." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-neutral-100">
                  {recentOrders.map((o) => (
                    <tr key={o._id}>
                      <td className="px-5 py-3 font-mono text-xs">{o.orderNumber || o._id.slice(-8)}</td>
                      <td className="px-5 py-3">{o.user?.fullname}</td>
                      <td className="px-5 py-3 text-neutral-500 text-xs">{fmtDate(o.createdAt)}</td>
                      <td className="px-5 py-3"><StatusBadge status={o.orderStatus} /></td>
                      <td className="px-5 py-3 text-right font-semibold">{formatINR(o.price?.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <div className="space-y-4">
          <Panel title="Low stock" testid="overview-low-stock" action={<AlertTriangle size={14} className="text-amber-500" />}><LowStock items={lowStock} /></Panel>
          <Panel title="Top products">
            {topProducts.length === 0 ? <EmptyState title="No sales yet" /> : (
              <ul className="divide-y divide-neutral-100">
                {topProducts.map((p) => (
                  <li key={p.productId} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="truncate pr-3">{p.tittle}</span>
                    <span className="font-semibold whitespace-nowrap">{formatINR(p.revenue)} <span className="text-neutral-400 font-normal text-xs">· {p.units}u</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
