import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { toggleWishlist } from "../store/slices/wishlistSlice.js";

export function useWishlist(productId) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);
  const active = useSelector((s) => s.wishlist.ids.includes(productId));

  const toggle = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!token) { toast.error("Sign in to save favourites"); navigate("/login"); return; }
    try {
      await dispatch(toggleWishlist({ productId, active })).unwrap();
      toast.success(active ? "Removed from wishlist" : "Saved to wishlist");
    } catch (msg) {
      toast.error(msg || "Could not update wishlist");
    }
  };

  return { active, toggle };
}
