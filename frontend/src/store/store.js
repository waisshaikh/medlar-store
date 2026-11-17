import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import cartReducer from "./slices/cartSlice.js";
import productReducer from "./slices/productSlice.js";
import { wishlistReducer, categoryReducer } from "./slices/wishlistSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    wishlist: wishlistReducer,
    categories: categoryReducer,
  },
});
