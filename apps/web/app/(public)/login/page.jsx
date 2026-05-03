'use client'

import { useAuth } from '@/app/AuthProvider'
import AuthInput from '@/components/auth/AuthInput'
import AuthShell from '@/components/auth/AuthShell'
import { getApiBaseUrl } from '@/lib/apiClient'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, submitting, isAuthenticated } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const redirectTarget = searchParams.get('redirect') || ''
  const highlights = useMemo(
    () => [
      'Manage products and inventory with one dashboard.',
      'Track customer orders and account activity in real time.',
      'Secure token-based authentication for every session.',
    ],
    []
  )

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await login(form)
      const role = response.data.user.role

      if (redirectTarget) {
        router.replace(redirectTarget)
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
    <AuthShell
      badge="Account Access"
      title="Welcome back to Singitronic"
      description="Sign in to continue managing products, orders, and your storefront experience."
      points={highlights}
      footnote={`API Endpoint: ${getApiBaseUrl()}`}
    >
      <div className="mx-auto w-full max-w-md">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Use your email and password to continue.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <AuthInput
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <AuthInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-7 text-sm text-slate-600">
          New here?{' '}
          <Link href="/register" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

