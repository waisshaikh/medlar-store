import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Layers,
} from "lucide-react";
import { toggleCart } from "../../store/slices/cartSlice.js";
import { logout } from "../../store/slices/authSlice.js";
import toast from "react-hot-toast";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const COLLECTIONS = useSelector((s) => s.categories.list).map((c) => ({ name: c.name, path: `/collections/${c.slug}` }));
  const wishCount = useSelector((s) => s.wishlist.ids.length);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const collectionsRef = useRef(null);
  const userRef = useRef(null);
  const cartCount = items.reduce((s, i) => s + (i.quantity || 1), 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target)) setCollectionsOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Signed out");
    navigate("/");
    setUserOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/85 border-b border-black/10 shadow-xs"
          : "backdrop-blur-md bg-white/45 border-b border-black/5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4 sm:gap-8">

          {/* ── 1. Logo inside white badge (exact reference) ── */}
          <Link to="/" className="shrink-0 flex items-center">
            <div className="bg-white px-3.5 py-1.5 rounded-lg shadow-xs border border-neutral-200/80 flex items-center justify-center hover:opacity-95 transition-opacity">
              <img
                src="/catalog/header/medlar-logo-compact.png"
                alt="Medlar"
                className="h-7 sm:h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden items-center gap-1.5">
                <span className="font-heading font-bold text-sm tracking-widest text-[#111111]">MEDLAR</span>
              </div>
            </div>
          </Link>

          {/* ── 2. Center Navigation Links (Matte Black) ── */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/shop"
              className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#111111] hover:text-[#E52B32] transition-colors"
            >
              Shop
            </Link>

            {/* Collections dropdown */}
            <div className="relative" ref={collectionsRef}>
              <button
                onClick={() => setCollectionsOpen(!collectionsOpen)}
                className="flex items-center gap-1 text-[11px] font-bold tracking-[0.22em] uppercase text-[#111111] hover:text-[#E52B32] transition-colors cursor-pointer"
              >
                Collections
                <ChevronDown size={12} className={`transition-transform duration-200 ${collectionsOpen ? "rotate-180" : ""}`} />
              </button>

              {collectionsOpen && (
                <div className="absolute top-full left-0 mt-3 w-56 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-xl shadow-xl py-2 z-50">
                  {COLLECTIONS.map((c) => (
                    <Link
                      key={c.path}
                      to={c.path}
                      onClick={() => setCollectionsOpen(false)}
                      className="block px-5 py-2.5 text-[11px] text-[#111111] hover:text-[#E52B32] hover:bg-neutral-50 tracking-widest uppercase font-semibold transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/journal"
              className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#111111] hover:text-[#E52B32] transition-colors"
            >
              Journal
            </Link>

            <Link
              to="/our-story"
              className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#111111] hover:text-[#E52B32] transition-colors"
            >
              Our Story
            </Link>
          </nav>

          {/* ── 3. Inline Working Search Bar (Matte Black Text) ── */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-[210px] lg:max-w-[270px]"
          >
            <div className="relative w-full flex items-center">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none shrink-0"
                size={14}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gear..."
                className="w-full bg-black/5 hover:bg-black/10 focus:bg-white text-[#111111] placeholder-neutral-500 text-xs pl-10 pr-4 py-2 rounded-full border border-black/15 focus:border-[#E52B32] focus:outline-none transition-all shadow-xs"
              />
            </div>
          </form>

          {/* ── 4. Right Action Icons (Matte Black) ── */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Wishlist */}
            <Link
              to={user ? "/account?tab=wishlist" : "/login"}
              data-testid="navbar-wishlist-link"
              className="relative p-2 text-[#111111] hover:text-[#E52B32] transition-colors hidden sm:block"
              title="Wishlist"
            >
              <Heart size={18} />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#111] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishCount}</span>}
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              data-testid="navbar-cart-button"
              className="relative p-2 text-[#111111] hover:text-[#E52B32] transition-colors cursor-pointer"
              title="Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span data-testid="navbar-cart-count" className="absolute -top-0.5 -right-0.5 bg-[#E52B32] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account */}
            <div className="relative hidden sm:block" ref={userRef}>
              <button
                onClick={() => setUserOpen(!userOpen)}
                data-testid="navbar-account-button"
                className="p-2 text-[#111111] hover:text-[#E52B32] transition-colors cursor-pointer"
                title="Account"
              >
                <User size={18} />
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="font-bold text-[#111111] text-sm truncate">{user.fullname}</p>
                        <p className="text-neutral-400 text-[11px] truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        to="/account"
                        data-testid="navbar-my-orders-link"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-[#E52B32] transition-colors"
                      >
                        <Package size={14} /> My Orders
                      </Link>
                      {user.role === "seller" && (
                        <Link
                          to="/seller"
                          data-testid="navbar-seller-portal-link"
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-[#E52B32] transition-colors"
                        >
                          <Layers size={14} /> Seller Portal
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        data-testid="navbar-logout-button"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-neutral-50 text-left transition-colors cursor-pointer border-t border-neutral-100 mt-1"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        data-testid="navbar-sign-in-link"
                        onClick={() => setUserOpen(false)}
                        className="block px-4 py-2.5 font-bold text-[#111111] hover:bg-neutral-50 hover:text-[#E52B32]"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        data-testid="navbar-register-link"
                        onClick={() => setUserOpen(false)}
                        className="block px-4 py-2.5 text-neutral-600 hover:bg-neutral-50 hover:text-[#E52B32]"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="navbar-mobile-menu-button"
              className="lg:hidden p-2 text-[#111111] hover:text-[#E52B32] transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bags, backpacks..."
                className="w-full bg-white/70 backdrop-blur-sm text-[#111111] placeholder-neutral-500 text-xs pl-12 pr-4 py-2 rounded-full border border-black/15 focus:outline-none focus:border-[#E52B32]"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-black/10 px-6 py-6 space-y-4">
          <div className="space-y-1 text-sm">
            {[{ label: "Shop", path: "/shop" }, { label: "Journal", path: "/journal" }, { label: "Our Story", path: "/our-story" }].map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-[#111111] font-bold tracking-widest uppercase border-b border-neutral-100"
              >
                {label}
              </Link>
            ))}
            <div className="py-2.5 border-b border-neutral-100">
              <p className="text-[#111111] font-bold tracking-widest uppercase mb-2">Collections</p>
              <div className="grid grid-cols-2 gap-1.5">
                {COLLECTIONS.map((c) => (
                  <Link
                    key={c.path}
                    to={c.path}
                    onClick={() => setMobileOpen(false)}
                    className="text-xs text-neutral-600 hover:text-[#E52B32] py-1 tracking-wider uppercase font-medium"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-2">
            {user ? (
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 px-4 rounded-xl border border-neutral-200 text-center text-xs font-bold uppercase tracking-wider text-[#111111]"
              >
                My Account
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 px-4 rounded-xl bg-[#E52B32] text-white text-center font-bold text-xs uppercase tracking-wider"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
