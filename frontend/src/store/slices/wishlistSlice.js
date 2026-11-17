import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../services/wishlist.api.js";
import { getCategories } from "../../services/category.api.js";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { rejectWithValue }) => {
  try { return (await getWishlist()).data.wishlist; } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const toggleWishlist = createAsyncThunk("wishlist/toggle", async ({ productId, active }, { rejectWithValue }) => {
  try {
    const res = active ? await removeFromWishlist(productId) : await addToWishlist(productId);
    return res.data.wishlist;
  } catch (err) { return rejectWithValue(err.response?.data?.message || "Could not update wishlist"); }
});

export const fetchCategories = createAsyncThunk("categories/fetch", async () => (await getCategories()).data.categories);

const setItems = (state, action) => {
  state.items = action.payload || [];
  state.ids = state.items.map((p) => p._id);
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [], ids: [] },
  reducers: { resetWishlist: (state) => { state.items = []; state.ids = []; } },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, setItems).addCase(toggleWishlist.fulfilled, setItems);
  },
});

const categorySlice = createSlice({
  name: "categories",
  initialState: { list: [], loaded: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.fulfilled, (state, action) => { state.list = action.payload || []; state.loaded = true; });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export const wishlistReducer = wishlistSlice.reducer;
export const categoryReducer = categorySlice.reducer;
