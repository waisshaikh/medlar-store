import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Store, LogOut } from "lucide-react";
import { logout } from "../../store/slices/authSlice.js";

export default function SellerHeader() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <header data-testid="seller-header" className="sticky top-0 z-40 bg-[#F7F4EF]/85 backdrop-blur-md border-b border-black/5">
      <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <Link to="/seller" data-testid="seller-header-logo" className="flex items-center gap-3 min-w-0">
          <img src="/catalog/header/medlar-logo-compact.png" alt="Medlar" className="h-7 w-auto" />
          <span className="hidden sm:inline-block h-5 w-px bg-neutral-300" />
          <span className="hidden sm:inline text-[10px] font-mono font-bold tracking-[0.25em] text-[#E52B32]">SELLER HUB</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            data-testid="seller-header-view-store"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold uppercase tracking-wider text-[#111] hover:border-[#111] transition-colors"
          >
            <Store size={14} /> <span className="hidden sm:inline">View store</span>
          </Link>
          <div className="hidden md:block text-right leading-tight">
            <p data-testid="seller-header-name" className="text-sm font-semibold text-[#111] truncate max-w-[180px]">{user?.fullname}</p>
            <p className="text-[11px] text-neutral-500 truncate max-w-[180px]">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            data-testid="seller-header-logout"
            title="Sign out"
            className="w-9 h-9 rounded-full bg-[#111] text-white flex items-center justify-center hover:bg-[#E52B32] transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
