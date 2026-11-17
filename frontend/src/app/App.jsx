import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { fetchMe } from "../store/slices/authSlice.js";
import { fetchCart, resetCart } from "../store/slices/cartSlice.js";
import { fetchWishlist, fetchCategories, resetWishlist } from "../store/slices/wishlistSlice.js";
import AppRoutes from "./App.route.jsx";
import Navbar from "../components/Navbar/Navbar.jsx";
import Footer from "../components/Footer/Footer.jsx";
import CartDrawer from "../components/CartDrawer/CartDrawer.jsx";
import "./App.css";

function useSession() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  // Google sign-in redirects back with ?token=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      window.location.replace(location.pathname);
    }
  }, [location, navigate]);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    } else {
      dispatch(resetCart());
      dispatch(resetWishlist());
    }
  }, [token, dispatch]);
}

function AppContent() {
  const location = useLocation();
  useSession();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isSellerPage = location.pathname.startsWith("/seller");
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-[#F7F4EF]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {!isAuthPage && !isSellerPage && <Navbar />}
      <CartDrawer />
      <div className={!isAuthPage && !isHome && !isSellerPage ? "pt-20" : ""}>
        <AppRoutes />
      </div>
      {!isAuthPage && !isSellerPage && <Footer />}
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: "#1a1a1a", color: "#fff", fontFamily: "'Inter', sans-serif" } }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
