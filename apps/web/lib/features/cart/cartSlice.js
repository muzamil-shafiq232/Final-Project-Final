import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addCartItemApi, fetchCustomerCartApi, removeCartItemApi, updateCartItemApi } from '@/lib/shopApi'

const applyCartState = (state, cartData) => {
  const items = cartData?.items || []
  const cartItemsMap = items.reduce((accumulator, item) => {
    if (item?.product_id != null) {
      accumulator[item.product_id] = item.quantity || 0
    }
    return accumulator
  }, {})

  state.cartItems = cartItemsMap
  state.total = cartData?.total_items || 0
  state.totalPrice = cartData?.total_price || 0
  state.lineItems = items.map((item) => ({
    id: item.product?.id?.toString() || item.product_id?.toString(),
    quantity: item.quantity,
    price: item.unit_price,
    product: item.product,
  }))
}

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async ({ token }, { rejectWithValue }) => {
    try {
      return await fetchCustomerCartApi(token)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cart.')
    }
  },
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ token, productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      return await addCartItemApi(token, {
        product_id: Number(productId),
        quantity,
      })
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add item to cart.')
    }
  },
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ token, productId }, { getState, rejectWithValue }) => {
    const currentQuantity = getState().cart.cartItems[productId] || 0
    const nextQuantity = Math.max(currentQuantity - 1, 0)
    try {
      return await updateCartItemApi(token, Number(productId), { quantity: nextQuantity })
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cart item.')
    }
  },
)

export const setCartItemQuantity = createAsyncThunk(
  'cart/setCartItemQuantity',
  async ({ token, productId, quantity }, { rejectWithValue }) => {
    try {
      return await updateCartItemApi(token, Number(productId), { quantity })
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cart item.')
    }
  },
)

export const deleteItemFromCart = createAsyncThunk(
  'cart/deleteItemFromCart',
  async ({ token, productId }, { rejectWithValue }) => {
    try {
      return await removeCartItemApi(token, Number(productId))
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove item from cart.')
    }
  },
)

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    total: 0,
    totalPrice: 0,
    cartItems: {},
    lineItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.cartItems = {}
      state.total = 0
      state.totalPrice = 0
      state.lineItems = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        applyCartState(state, action.payload)
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch cart.'
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        applyCartState(state, action.payload)
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add item.'
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        applyCartState(state, action.payload)
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update item.'
      })
      .addCase(setCartItemQuantity.fulfilled, (state, action) => {
        applyCartState(state, action.payload)
      })
      .addCase(setCartItemQuantity.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update item.'
      })
      .addCase(deleteItemFromCart.fulfilled, (state, action) => {
        applyCartState(state, action.payload)
      })
      .addCase(deleteItemFromCart.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete item.'
      })
  },
})

export const { clearCart } = cartSlice.actions

export default cartSlice.reducer
