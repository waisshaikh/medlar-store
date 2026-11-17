import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllProducts, getProductById } from "../../services/product.api.js";

export const fetchProducts = createAsyncThunk("products/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const res = await getAllProducts(params);
    return { products: res.data?.products || [] };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to load products");
  }
});

export const fetchProductDetail = createAsyncThunk("products/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const res = await getProductById(id);
    return { product: res.data.product };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Product not found");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState: { list: [], currentProduct: null, loading: false, detailLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.loading = false; state.list = action.payload.products; })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductDetail.pending, (state) => { state.detailLoading = true; state.error = null; })
      .addCase(fetchProductDetail.fulfilled, (state, action) => { state.detailLoading = false; state.currentProduct = action.payload.product; })
      .addCase(fetchProductDetail.rejected, (state, action) => { state.detailLoading = false; state.currentProduct = null; state.error = action.payload; });
  },
});

export default productSlice.reducer;
