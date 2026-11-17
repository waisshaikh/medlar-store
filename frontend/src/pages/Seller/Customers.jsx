import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getSellerCustomers } from "../../services/seller.api.js";
import { PageHeader, Panel, Spinner, EmptyState, inputCls } from "../../components/Seller/ui.jsx";
import { formatINR, fmtDate } from "../../utils/format.js";

export default function Customers() {
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      getSellerCustomers({ q: q || undefined }).then((res) => setCustomers(res.data.customers)).catch(() => toast.error("Failed to load customers"));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div data-testid="seller-customers-page">
      <PageHeader eyebrow="People" title="Customers" subtitle="Registered shoppers ranked by lifetime spend." />
      <Panel>
        <div className="p-4 border-b border-neutral-100 relative">
          <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input data-testid="customers-search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone" className={`${inputCls} pl-9`} />
        </div>
        {!customers ? <Spinner /> : customers.length === 0 ? <EmptyState icon={Users} title="No customers found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="customers-table">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 border-b border-neutral-100">
                  <th className="px-5 py-3">Customer</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Orders</th><th className="px-5 py-3">Last order</th><th className="px-5 py-3 text-right">Spent</th><th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customers.map((c) => (
                  <tr key={c._id} data-testid={`customer-row-${c._id}`}>
                    <td className="px-5 py-3"><p className="font-medium">{c.fullname}</p><p className="text-[11px] text-neutral-500">{c.email}</p></td>
                    <td className="px-5 py-3 text-neutral-600">{c.contact || "—"}</td>
                    <td className="px-5 py-3 text-neutral-600 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                    <td className="px-5 py-3">{c.ordersCount}</td>
                    <td className="px-5 py-3 text-neutral-600 whitespace-nowrap">{fmtDate(c.lastOrderAt)}</td>
                    <td className="px-5 py-3 text-right font-semibold">{formatINR(c.totalSpent)}</td>
                    <td className="px-5 py-3 text-right"><Link data-testid={`customer-orders-${c._id}`} to={`/seller/orders?customer=${c._id}`} className="text-[11px] font-bold uppercase text-[#E52B32] whitespace-nowrap">Orders</Link></td>
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
