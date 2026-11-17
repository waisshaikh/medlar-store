import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Home from "../pages/Home/Home.jsx";
import Shop from "../pages/Shop/Shop.jsx";
import ProductDetail from "../pages/Product/ProductDetail.jsx";
import Cart from "../pages/Cart/Cart.jsx";
import Checkout from "../pages/Checkout/Checkout.jsx";
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import CustomerDashboard from "../pages/Customer/Dashboard.jsx";
import SellerLayout from "../components/Seller/SellerLayout.jsx";
import Overview from "../pages/Seller/Overview.jsx";
import Products from "../pages/Seller/Products.jsx";
import ProductForm from "../pages/Seller/ProductForm.jsx";
import Categories from "../pages/Seller/Categories.jsx";
import SellerOrders from "../pages/Seller/SellerOrders.jsx";
import Payments from "../pages/Seller/Payments.jsx";
import Customers from "../pages/Seller/Customers.jsx";

function ProtectedRoute({ children, role }) {
  const { user, token } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (role && !user) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#E52B32] border-t-transparent rounded-full animate-spin" /></div>;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/collections/:category" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/wishlist" element={<Navigate to="/account?tab=wishlist" replace />} />
      <Route path="/seller" element={<ProtectedRoute role="seller"><SellerLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="add-product" element={<Navigate to="/seller/products/new" replace />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="customers" element={<Customers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
