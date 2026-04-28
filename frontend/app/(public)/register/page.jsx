'use client'

import { useAuth } from '@/app/AuthProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
    <div className="mx-6 min-h-[75vh] flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-800">Register</h1>
        <p className="text-slate-500 mt-1">Create your customer account.</p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-slate-600">Full name</label>
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={onChange}
              className="mt-1 w-full rounded-md border border-slate-300 p-2.5 outline-slate-500"
              placeholder="John Doe"
            />
          </div>

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
              minLength={8}
              required
              value={form.password}
              onChange={onChange}
              className="mt-1 w-full rounded-md border border-slate-300 p-2.5 outline-slate-500"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Confirm password</label>
            <input
              name="password_confirmation"
              type="password"
              minLength={8}
              required
              value={form.password_confirmation}
              onChange={onChange}
              className="mt-1 w-full rounded-md border border-slate-300 p-2.5 outline-slate-500"
              placeholder="Repeat password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full rounded-full bg-indigo-500 py-2.5 text-white transition hover:bg-indigo-600 disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}

