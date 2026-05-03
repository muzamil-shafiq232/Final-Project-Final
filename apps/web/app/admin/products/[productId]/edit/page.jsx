'use client'

import { useAuth } from '@/app/AuthProvider'
import Loading from '@/components/Loading'
import {
  fetchAdminCategoriesApi,
  fetchAdminProductByIdApi,
  updateAdminProductApi,
} from '@/lib/shopApi'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminEditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { token } = useAuth()
  const productId = params?.productId

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [previewImage, setPreviewImage] = useState('/favicon.ico')
  const [form, setForm] = useState({
    name: '',
    description: '',
    short_description: '',
    compare_at_price: '',
    price: '',
    stock: '',
    category_id: '',
    is_active: true,
    image_url: '',
  })

  useEffect(() => {
    const loadPageData = async () => {
      if (!token || !productId) return

      setLoading(true)
      try {
        const [categoryData, productData] = await Promise.all([
          fetchAdminCategoriesApi(token),
          fetchAdminProductByIdApi(token, productId),
        ])

        setCategories(categoryData)
        setPreviewImage(productData.images?.[0] || '/favicon.ico')
        setForm({
          name: productData.name || '',
          description: productData.description || '',
          short_description: productData.short_description || '',
          compare_at_price: productData.compare_at_price ?? '',
          price: productData.price ?? '',
          stock: productData.stock ?? '',
          category_id: productData.category?.id ? String(productData.category.id) : '',
          is_active: Boolean(productData.is_active),
          image_url: '',
        })
      } catch (error) {
        toast.error(error.message || 'Failed to load product.')
      } finally {
        setLoading(false)
      }
    }

    loadPageData()
  }, [token, productId])

  const onChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!token || !productId) return

    const payload = {
      name: form.name,
      description: form.description,
      short_description: form.short_description || null,
      compare_at_price: form.compare_at_price === '' ? null : Number(form.compare_at_price),
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
      is_active: form.is_active,
    }

    if (form.image_url.trim()) {
      payload.image_urls = [form.image_url.trim()]
    }

    setSaving(true)
    try {
      await updateAdminProductApi(token, productId, payload)
      toast.success('Product updated successfully.')
      router.replace('/admin/products')
    } catch (error) {
      toast.error(error.message || 'Failed to update product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading label="Loading product..." />

  return (
    <div className="space-y-6">
      <header className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="mt-1 text-sm text-blue-100">Update item details, stock, and visibility.</p>
      </header>

      <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-600">Preview</h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Image
                src={previewImage}
                alt=""
                width={360}
                height={360}
                className="mx-auto h-52 w-auto object-contain"
              />
            </div>
            <input
              type="url"
              name="image_url"
              onChange={onChange}
              value={form.image_url}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              placeholder="Replace image URL (optional)"
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-600">Details</h2>

            <input
              type="text"
              name="name"
              onChange={onChange}
              value={form.name}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              required
            />

            <textarea
              name="description"
              onChange={onChange}
              value={form.description}
              rows={5}
              className="w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              required
            />

            <input
              type="text"
              name="short_description"
              onChange={onChange}
              value={form.short_description}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              placeholder="Short description"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="number"
                step="0.01"
                name="compare_at_price"
                onChange={onChange}
                value={form.compare_at_price}
                className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                placeholder="MRP"
              />
              <input
                type="number"
                step="0.01"
                name="price"
                onChange={onChange}
                value={form.price}
                className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                placeholder="Offer price"
                required
              />
              <input
                type="number"
                name="stock"
                onChange={onChange}
                value={form.stock}
                className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                placeholder="Stock"
                required
              />
            </div>

            <select
              onChange={onChange}
              name="category_id"
              value={form.category_id}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={onChange}
                className="accent-blue-600"
              />
              Active product
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="rounded border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}
