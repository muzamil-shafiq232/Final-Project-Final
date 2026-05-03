'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/AuthProvider"
import { deleteAdminProductApi, fetchAdminProductsApi, updateAdminProductApi } from "@/lib/shopApi"
import Loading from "@/components/Loading"

export default function AdminProductsPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const router = useRouter()
    const { token } = useAuth()

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchProducts = useCallback(async () => {
        if (!token) return
        setLoading(true)
        try {
            const response = await fetchAdminProductsApi(token)
            setProducts(response)
        } catch (error) {
            toast.error(error.message || 'Failed to load products.')
        } finally {
            setLoading(false)
        }
    }, [token])

    const toggleStock = async (product) => {
        await updateAdminProductApi(token, product.id, {
            stock: product.stock > 0 ? 0 : 25,
            is_active: product.stock === 0,
        })
        await fetchProducts()
    }

    const deleteProduct = async (productId) => {
        await deleteAdminProductApi(token, productId)
        await fetchProducts()
    }

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const inventoryTotals = useMemo(() => ({
        total: products.length,
        activeStock: products.filter((product) => Number(product.stock) > 0).length,
    }), [products])

    if (loading) return <Loading label="Loading products..." />

    return (
        <div className="space-y-6">
            <header className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Product Inventory</h1>
                        <p className="mt-1 text-sm text-blue-100">Manage product listings, pricing, stock, and visibility.</p>
                    </div>
                    <button
                        onClick={() => router.push('/admin/products/new')}
                        className="rounded bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                        Add Product
                    </button>
                </div>
                <div className="mt-4 flex gap-2 text-xs">
                    <span className="rounded-full bg-blue-700 px-3 py-1">Products: {inventoryTotals.total}</span>
                    <span className="rounded-full bg-emerald-600 px-3 py-1">In stock: {inventoryTotals.activeStock}</span>
                </div>
            </header>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                    <article key={product.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex gap-3">
                            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                                <Image width={80} height={80} className='h-16 w-auto object-contain' src={product.images?.[0] || '/favicon.ico'} alt={product.name || 'product'} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-semibold text-slate-900">{product.name || '-'}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{product.category?.name || 'Uncategorized'}</p>
                                <div className="mt-3 flex items-center gap-2 text-sm">
                                    <p className="font-bold text-slate-900">{currency}{Number(product.price).toLocaleString()}</p>
                                    <p className="text-slate-500 line-through">{currency}{Number(product.compare_at_price || product.price).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                            <p className="text-xs text-slate-500">ID: {product.id}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                className="rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => toast.promise(toggleStock(product), { loading: 'Updating stock...' })}
                                className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                {product.stock > 0 ? 'Mark Out' : 'Restock'}
                            </button>
                            <button
                                onClick={() => toast.promise(deleteProduct(product.id), { loading: 'Deleting product...' })}
                                className="rounded border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                            >
                                Delete
                            </button>
                        </div>
                    </article>
                ))}
                {products.length === 0 && (
                    <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
                        No products found.
                    </article>
                )}
            </section>
        </div>
    )
}
