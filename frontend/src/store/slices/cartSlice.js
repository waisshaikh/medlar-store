import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart as clearCartApi } from "../../services/cart.api.js";

const message = (err) => err.response?.data?.message || "Something went wrong";
const cartPayload = (res) => res.data.cart || { items: [], totalPrice: 0 };

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try { return cartPayload(await getCart()); } catch (err) { return rejectWithValue(message(err)); }
});

export const addItem = createAsyncThunk("cart/add", async ({ productId, variantId, quantity }, { rejectWithValue }) => {
  try { return cartPayload(await addToCart(productId, variantId, quantity)); } catch (err) { return rejectWithValue(message(err)); }
});

export const updateItem = createAsyncThunk("cart/update", async ({ itemId, quantity }, { rejectWithValue }) => {
  try { return cartPayload(await updateCartItem(itemId, quantity)); } catch (err) { return rejectWithValue(message(err)); }
});

export const removeItem = createAsyncThunk("cart/remove", async (itemId, { rejectWithValue }) => {
  try { return cartPayload(await removeCartItem(itemId)); } catch (err) { return rejectWithValue(message(err)); }
});

export const clearCart = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try { await clearCartApi(); return { items: [], totalPrice: 0 }; } catch (err) { return rejectWithValue(message(err)); }
});

const apply = (state, action) => {
  state.loading = false;
  state.items = action.payload.items || [];
  state.totalPrice = action.payload.totalPrice || 0;
  state.currency = action.payload.currency || "INR";
};

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], totalPrice: 0, currency: "INR", loading: false, isOpen: false },
  reducers: {
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    openCart: (state) => { state.isOpen = true; },
    closeCart: (state) => { state.isOpen = false; },
    resetCart: (state) => { state.items = []; state.totalPrice = 0; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.pending, (state) => { state.loading = true; });
    builder.addCase(fetchCart.rejected, (state) => { state.loading = false; });
    [fetchCart, addItem, updateItem, removeItem, clearCart].forEach((thunk) => builder.addCase(thunk.fulfilled, apply));
  },
});

export const { toggleCart, openCart, closeCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
