import { apiRequest, getApiBaseUrl } from '@/lib/apiClient'

const API_ORIGIN = (() => {
  try {
    return new URL(getApiBaseUrl()).origin
  } catch {
    return 'http://127.0.0.1:8000'
  }
})()

const castBoolean = (value) => value === true || value === 1 || value === '1'

const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return '/favicon.ico'
  }

  const trimmed = imageUrl.trim()
  if (!trimmed) {
    return '/favicon.ico'
  }

  if (trimmed.startsWith('/')) {
    return `${API_ORIGIN}${trimmed}`
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return `${API_ORIGIN}/${trimmed.replace(/^\/+/, '')}`
  }

  return trimmed
}

const createDataTableQuery = ({ page = 1, perPage = 20, search = '', extra = {} } = {}) => {
  const currentPage = Math.max(Number(page) || 1, 1)
  const length = Math.max(Number(perPage) || 20, 1)
  const start = (currentPage - 1) * length

  const searchParams = new URLSearchParams({
    draw: '1',
    start: String(start),
    length: String(length),
  })

  if (search) {
    searchParams.set('search[value]', search)
  }

  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  return { query: searchParams.toString(), currentPage, length, start }
}

const normalizeProduct = (product) => ({
  id: String(product.id),
  name: product.name,
  description: product.description || product.short_description || '',
  mrp: product.compare_at_price ?? product.price,
  price: product.price,
  images:
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map(normalizeImageUrl)
      : ['/favicon.ico'],
  category: product.category?.name || 'Uncategorized',
  categorySlug: product.category?.slug || '',
  inStock: product.in_stock ?? product.stock > 0,
  stock: product.stock ?? 0,
  rating: [],
  store: {
    name: 'Singitronic',
    username: 'singitronic',
    logo: '/favicon.ico',
  },
  createdAt: product.created_at,
  updatedAt: product.updated_at,
})

export const fetchProductsApi = async (params = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  const response = await apiRequest(`/products${query ? `?${query}` : ''}`, { method: 'GET' })
  return {
    products: (response.data || []).map(normalizeProduct),
    meta: response.meta || {},
  }
}

export const fetchProductByIdApi = async (productId) => {
  const response = await apiRequest(`/products/${productId}`, { method: 'GET' })
  return normalizeProduct(response.data)
}

export const fetchCategoriesApi = async (params = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  const response = await apiRequest(`/categories${query ? `?${query}` : ''}`, { method: 'GET' })
  return response.data || []
}

export const fetchAdminProductsApi = async (token, params = {}) => {
  const { query } = createDataTableQuery({
    page: params.page || 1,
    perPage: params.per_page || 200,
    search: params.search || '',
    extra: { include_inactive: 1 },
  })

  const response = await apiRequest(`/admin/datatables/products?${query}`, {
    method: 'GET',
    token,
  })

  return (response.data || []).map((row) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price || 0),
    compare_at_price: row.compare_at_price !== null ? Number(row.compare_at_price) : null,
    stock: Number(row.stock || 0),
    is_active: castBoolean(row.is_active),
    category: row.category_name ? { name: row.category_name } : null,
    images: row.primary_image ? [normalizeImageUrl(row.primary_image)] : ['/favicon.ico'],
  }))
}

export const fetchAdminProductByIdApi = async (token, productId) => {
  const response = await apiRequest(`/admin/products/${productId}`, {
    method: 'GET',
    token,
  })

  return {
    ...response.data,
    images:
      Array.isArray(response.data?.images) && response.data.images.length > 0
        ? response.data.images.map(normalizeImageUrl)
        : ['/favicon.ico'],
  }
}

export const createAdminProductApi = async (token, formData) => {
  const response = await apiRequest('/admin/products', {
    method: 'POST',
    token,
    body: formData,
  })
  return response.data
}

export const updateAdminProductApi = async (token, productId, payload) => {
  const response = await apiRequest(`/admin/products/${productId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  })
  return response.data
}

export const deleteAdminProductApi = async (token, productId) => {
  await apiRequest(`/admin/products/${productId}`, {
    method: 'DELETE',
    token,
  })
}

export const fetchAdminCategoriesApi = async (token) => {
  const response = await apiRequest('/admin/categories?include_inactive=1', {
    method: 'GET',
    token,
  })
  return response.data || []
}

export const createAdminCategoryApi = async (token, payload) => {
  const response = await apiRequest('/admin/categories', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
  return response.data
}

export const updateAdminCategoryApi = async (token, categoryId, payload) => {
  const response = await apiRequest(`/admin/categories/${categoryId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  })
  return response.data
}

export const deleteAdminCategoryApi = async (token, categoryId) => {
  await apiRequest(`/admin/categories/${categoryId}`, {
    method: 'DELETE',
    token,
  })
}

export const fetchCustomerCartApi = async (token) => {
  const response = await apiRequest('/customer/cart', {
    method: 'GET',
    token,
  })
  return response.data
}

export const addCartItemApi = async (token, payload) => {
  const response = await apiRequest('/customer/cart/items', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
  return response.data
}

export const updateCartItemApi = async (token, productId, payload) => {
  const response = await apiRequest(`/customer/cart/items/${productId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  })
  return response.data
}

export const removeCartItemApi = async (token, productId) => {
  const response = await apiRequest(`/customer/cart/items/${productId}`, {
    method: 'DELETE',
    token,
  })
  return response.data
}

const normalizeOrder = (order) => ({
  id: String(order.id),
  total: order.total_amount,
  status: (order.status || '').toUpperCase(),
  paymentMethod: order.payment_method,
  createdAt: order.placed_at || order.created_at,
  orderItems: (order.items || []).map((item) => ({
    quantity: item.quantity,
    price: item.unit_price,
    product: {
      id: String(item.product_id || item.product?.id),
      name: item.product_name || item.product?.name,
      images:
        item.product?.images?.length
          ? item.product.images.map(normalizeImageUrl)
          : ['/favicon.ico'],
    },
  })),
  address: {
    name: order.shipping_address?.name,
    email: order.shipping_address?.email,
    phone: order.shipping_address?.phone,
    street: order.shipping_address?.street,
    city: order.shipping_address?.city,
    state: order.shipping_address?.state,
    zip: order.shipping_address?.zip,
    country: order.shipping_address?.country,
  },
})

export const placeOrderApi = async (token, payload) => {
  const response = await apiRequest('/customer/orders', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
  return normalizeOrder(response.data)
}

export const fetchCustomerOrdersApi = async (token) => {
  const response = await apiRequest('/customer/orders', {
    method: 'GET',
    token,
  })
  return (response.data || []).map(normalizeOrder)
}

const normalizeAdminOrder = (order) => ({
  statusRaw: (order.status || '').toLowerCase(),
  id: String(order.id),
  orderNumber: order.order_number,
  status: (order.status || '').toUpperCase(),
  paymentStatus: (order.payment_status || '').toUpperCase(),
  paymentMethod: order.payment_method,
  total: order.total_amount,
  createdAt: order.placed_at || order.created_at,
  customer: {
    id: order.user?.id ? String(order.user.id) : null,
    name: order.user?.name || order.shipping_address?.name || 'Unknown',
    email: order.user?.email || order.shipping_address?.email || '',
  },
  itemsCount: (order.items || []).reduce((acc, item) => acc + (item.quantity || 0), 0),
})

export const fetchAdminDashboardStatsApi = async (token) => {
  const response = await apiRequest('/admin/dashboard/stats', {
    method: 'GET',
    token,
  })
  return {
    totalSales: response.data?.total_sales || 0,
    totalOrders: response.data?.total_orders || 0,
    totalUsers: response.data?.total_users || 0,
    statusBreakdown: response.data?.status_breakdown || {},
    latestOrders: (response.data?.latest_orders || []).map(normalizeAdminOrder),
  }
}

export const fetchAdminOrdersApi = async (token, params = {}) => {
  const { query, currentPage, length } = createDataTableQuery({
    page: params.page || 1,
    perPage: params.per_page || 20,
    search: params.search || '',
    extra: { status: params.status || '' },
  })

  const response = await apiRequest(`/admin/datatables/orders?${query}`, {
    method: 'GET',
    token,
  })

  const total = Number(response.recordsFiltered ?? response.recordsTotal ?? 0)

  return {
    orders: (response.data || []).map((row) =>
      normalizeAdminOrder({
        id: row.id,
        order_number: row.order_number,
        status: row.status,
        payment_status: row.payment_status,
        payment_method: row.payment_method,
        total_amount: row.total_amount,
        created_at: row.created_at,
        user: {
          name: row.user_name,
          email: row.user_email,
        },
        shipping_address: {
          name: row.customer_name,
          email: row.customer_email,
        },
        items: [],
      }),
    ),
    meta: {
      current_page: currentPage,
      last_page: Math.max(Math.ceil(total / length), 1),
      per_page: length,
      total,
    },
  }
}

export const updateAdminOrderStatusApi = async (token, orderId, status) => {
  const response = await apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  })
  return normalizeAdminOrder(response.data)
}

export const fetchAdminUsersApi = async (token, params = {}) => {
  const { query, currentPage, length } = createDataTableQuery({
    page: params.page || 1,
    perPage: params.per_page || 20,
    search: params.search || '',
  })

  const response = await apiRequest(`/admin/datatables/users?${query}`, {
    method: 'GET',
    token,
  })

  const total = Number(response.recordsFiltered ?? response.recordsTotal ?? 0)

  return {
    users: (response.data || []).map((user) => ({
      ...user,
      is_active: castBoolean(user.is_active),
      orders_count: Number(user.orders_count || 0),
      total_spent: Number(user.total_spent || 0),
    })),
    meta: {
      current_page: currentPage,
      last_page: Math.max(Math.ceil(total / length), 1),
      per_page: length,
      total,
    },
  }
}

export const updateAdminUserApi = async (token, userId, payload) => {
  const response = await apiRequest(`/admin/users/${userId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
  return response.data
}

export const sendContactMessageApi = async (token, payload) => {
  const response = await apiRequest('/contact-messages', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
  return response.data
}

const normalizeContactMessage = (message) => ({
  id: message.id,
  name: message.name,
  email: message.email,
  subject: message.subject,
  message: message.message,
  status: message.status,
  adminReply: message.admin_reply || '',
  repliedAt: message.replied_at,
  createdAt: message.created_at,
  updatedAt: message.updated_at,
})

export const fetchMyContactMessagesApi = async (token) => {
  const response = await apiRequest('/contact-messages', {
    method: 'GET',
    token,
  })

  return (response.data || []).map(normalizeContactMessage)
}

export const fetchAdminContactMessagesApi = async (token, params = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  const response = await apiRequest(`/admin/contact-messages${query ? `?${query}` : ''}`, {
    method: 'GET',
    token,
  })

  return {
    messages: (response.data || []).map(normalizeContactMessage),
    meta: response.meta || {},
  }
}

export const replyAdminContactMessageApi = async (token, messageId, reply) => {
  const response = await apiRequest(`/admin/contact-messages/${messageId}/reply`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ reply }),
  })

  return normalizeContactMessage(response.data)
}

