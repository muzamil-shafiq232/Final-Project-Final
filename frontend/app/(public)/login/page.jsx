'use client'

import { useAuth } from '@/app/AuthProvider'
import { getApiBaseUrl } from '@/lib/apiClient'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, submitting, isAuthenticated } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [redirect, setRedirect] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setRedirect(params.get('redirect') || '')
    }
  }, [])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await login(form)
      const role = response.data.user.role

      if (redirect) {
        router.replace(redirect)
        return
      }

      router.replace(role === 'admin' ? '/admin' : '/')
      toast.success('Logged in successfully.')
    } catch (error) {
      toast.error(error.message || 'Unable to login.')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(user?.role === 'admin' ? '/admin' : '/')
    }
  }, [isAuthenticated, router, user?.role])

  if (isAuthenticated) return null

  return (
    <div className="mx-6 min-h-[75vh] flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-800">Login</h1>
        <p className="text-slate-500 mt-1">
          Sign in with your account to continue. Backend: <span className="font-medium">{getApiBaseUrl()}</span>
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              className="mt-1 w-full rounded-md border border-slate-300 p-2.5 outline-slate-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={onChange}
              className="mt-1 w-full rounded-md border border-slate-300 p-2.5 outline-slate-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full rounded-full bg-indigo-500 py-2.5 text-white transition hover:bg-indigo-600 disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          New user?{' '}
          <Link href="/register" className="font-medium text-indigo-600">
            Create account
          </Link>
        </p>
      </form>
    </div>
  )
}

