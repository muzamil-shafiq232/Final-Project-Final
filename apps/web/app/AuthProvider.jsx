'use client'

import { apiRequest } from '@/lib/apiClient'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const SESSION_KEY = 'singitronic_auth_session'

const AuthContext = createContext(null)

const setCookie = (key, value, maxAgeSeconds = 60 * 60 * 24 * 7) => {
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
}

const clearCookie = (key) => {
  document.cookie = `${key}=; path=/; max-age=0; samesite=lax`
}

const readStoredSession = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const normalizeRole = (role) => (typeof role === 'string' ? role.trim().toLowerCase() : '')

  const persistSession = useCallback((nextSession) => {
    if (!nextSession) {
      localStorage.removeItem(SESSION_KEY)
      clearCookie('auth_token')
      clearCookie('auth_role')
      clearCookie('auth_user_id')
      setSession(null)
      return
    }

    const role = normalizeRole(nextSession.user?.role)
    const normalizedSession = {
      ...nextSession,
      user: {
        ...nextSession.user,
        role,
      },
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedSession))
    setCookie('auth_token', nextSession.token)
    setCookie('auth_role', role)
    setCookie('auth_user_id', nextSession.user.id)
    setSession(normalizedSession)
  }, [])

  useEffect(() => {
    let cancelled = false

    const initializeSession = async () => {
      const stored = readStoredSession()
      if (!stored?.token) {
        if (!cancelled) {
          setSession(null)
          setInitializing(false)
        }
        return
      }

      if (!cancelled) {
        setSession(stored)
      }

      try {
        const response = await apiRequest('/auth/me', {
          method: 'GET',
          token: stored.token,
        })

        if (!cancelled) {
          persistSession({
            ...stored,
            user: response.data,
          })
        }
      } catch {
        if (!cancelled) {
          persistSession(null)
        }
      } finally {
        if (!cancelled) {
          setInitializing(false)
        }
      }
    }

    initializeSession()

    return () => {
      cancelled = true
    }
  }, [persistSession])

  const register = useCallback(async (payload) => {
    setSubmitting(true)
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      persistSession(response.data)
      return response
    } catch (error) {
      persistSession(null)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [persistSession])

  const login = useCallback(async (payload) => {
    setSubmitting(true)
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      persistSession(response.data)
      return response
    } catch (error) {
      persistSession(null)
      throw error
    } finally {
      setSubmitting(false)
    }
  }, [persistSession])

  const fetchProfile = useCallback(async (tokenOverride) => {
    const activeToken = tokenOverride || session?.token
    if (!activeToken) {
      return null
    }

    const response = await apiRequest('/auth/me', {
      method: 'GET',
      token: activeToken,
    })

    const nextSession = {
      ...session,
      token: activeToken,
      user: response.data,
    }
    persistSession(nextSession)
    return response.data
  }, [persistSession, session])

  const logout = useCallback(async () => {
    const token = session?.token
    setSubmitting(true)
    try {
      if (token) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          token,
        })
      }
    } finally {
      persistSession(null)
      setSubmitting(false)
    }
  }, [persistSession, session?.token])

  const value = useMemo(
    () => {
      const role = normalizeRole(session?.user?.role)

      return {
      session,
      token: session?.token || null,
      user: session?.user || null,
      isAuthenticated: Boolean(session?.token),
      isAdmin: role === 'admin',
      isCustomer: role === 'customer',
      initializing,
      submitting,
      register,
      login,
      logout,
      fetchProfile,
    }
    },
    [session, initializing, submitting, register, login, logout, fetchProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }
  return context
}

