import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchProductsApi } from '@/lib/shopApi'

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchProductsApi(params)
      return response.products
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products.')
    }
  },
)

const productSlice = createSlice({
  name: 'product',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    setProduct: (state, action) => {
      state.list = action.payload
    },
    clearProduct: (state) => {
      state.list = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch products.'
      })
  },
})

export const { setProduct, clearProduct } = productSlice.actions

export default productSlice.reducer
