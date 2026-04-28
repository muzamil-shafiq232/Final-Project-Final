const normalizeBaseUrl = (value) => {
  const fallback = 'http://127.0.0.1:8000/api/v1'
  if (!value || typeof value !== 'string') {
    return fallback
  }

  const cleaned = value.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '')
  return cleaned || fallback
}

const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)

export const getApiBaseUrl = () => API_BASE_URL

const emitNetworkEvent = (eventName) => {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new CustomEvent(eventName))
}

export async function apiRequest(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const defaultHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
  }

  emitNetworkEvent('app:network-start')
  try {
    let response
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {}),
        },
        cache: 'no-store',
      })
    } catch {
      throw new Error(
        `Cannot reach API (${API_BASE_URL}). Ensure backend is running and CORS allows this frontend origin.`,
      )
    }

    const responseText = await response.text()
    const payload = responseText
      ? (() => {
          try {
            return JSON.parse(responseText)
          } catch {
            return null
          }
        })()
      : null

    if (!response.ok || payload?.success === false) {
      const message = payload?.message || responseText || `Request failed (${response.status}).`
      const errors = payload?.errors || null
      const error = new Error(message)
      error.details = errors
      throw error
    }

    return payload
  } finally {
    emitNetworkEvent('app:network-end')
  }
}

