import { NavLink, Outlet } from "react-router-dom";
import SellerHeader from "./SellerHeader.jsx";
import { useSelector } from "react-redux";
import { LayoutDashboard, Package, Tags, ShoppingBag, CreditCard, Users, Plus } from "lucide-react";

const NAV = [
  { to: "/seller", label: "Overview", icon: LayoutDashboard, end: true, id: "overview" },
  { to: "/seller/products", label: "Products", icon: Package, id: "products" },
  { to: "/seller/categories", label: "Categories", icon: Tags, id: "categories" },
  { to: "/seller/orders", label: "Orders", icon: ShoppingBag, id: "orders" },
  { to: "/seller/payments", label: "Payments", icon: CreditCard, id: "payments" },
  { to: "/seller/customers", label: "Customers", icon: Users, id: "customers" },
];

export default function SellerLayout() {
  const { user } = useSelector((s) => s.auth);
  return (
    <div className="min-h-screen bg-[#F7F4EF]" data-testid="seller-layout">
      <SellerHeader />
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 py-6">
        <aside className="lg:w-60 shrink-0">
          <div className="lg:sticky lg:top-[88px] bg-[#101010] text-white rounded-2xl p-4 lg:p-5">
            <div className="hidden lg:block pb-5 mb-4 border-b border-white/10">
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#E52B32]">SELLER HUB</span>
              <p className="font-heading font-bold text-lg mt-1 truncate">{user?.fullname}</p>
              <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
            </div>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-none">
              {NAV.map(({ to, label, icon: Icon, end, id }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  data-testid={`seller-nav-${id}`}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${isActive ? "bg-[#E52B32] text-white" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}
                >
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
            </nav>
            <NavLink
              to="/seller/products/new"
              data-testid="seller-nav-add-product"
              className="hidden lg:flex mt-6 items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-[#111] hover:bg-[#E52B32] hover:text-white transition-colors"
            >
              <Plus size={14} /> New product
            </NavLink>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
