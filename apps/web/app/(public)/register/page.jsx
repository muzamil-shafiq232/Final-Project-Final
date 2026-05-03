'use client'

import { useAuth } from '@/app/AuthProvider'
import AuthInput from '@/components/auth/AuthInput'
import AuthShell from '@/components/auth/AuthShell'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { register, submitting, isAuthenticated, user } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer',
  })
  const highlights = useMemo(
    () => [
      'Create orders faster with saved account details.',
      'Track current and past orders from one place.',
      'Contact support and manage profile details anytime.',
    ],
    []
  )

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      const response = await register(form)
      const role = response.data.user.role
      router.replace(role === 'admin' ? '/admin' : '/')
      toast.success('Account created successfully.')
    } catch (error) {
      toast.error(error.message || 'Unable to register.')
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
      badge="New Account"
      title="Set up your customer profile"
      description="Create an account in seconds to place orders, save your details, and manage everything in one dashboard."
      points={highlights}
      footnote="Customer role is applied automatically during registration."
    >
      <div className="mx-auto w-full max-w-md">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Create account</h2>
          <p className="mt-2 text-sm text-slate-500">Fill the form below to get started.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <AuthInput
            label="Full name"
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            placeholder="John Doe"
            autoComplete="name"
            required
          />

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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <AuthInput
            label="Confirm password"
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={onChange}
            placeholder="Repeat password"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-sm text-slate-600">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

