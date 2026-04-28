'use client'

import { useAuth } from "@/app/AuthProvider"
import Loading from "@/components/Loading"
import { fetchAdminOrdersApi, updateAdminOrderStatusApi } from "@/lib/shopApi"
import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

const DEFAULT_ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']

const normalizeStatusInput = (value) => (
    (value || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_-]/g, '')
        .replace(/^[_-]+|[_-]+$/g, '')
)

const toStatusLabel = (value) => (
    (value || '')
        .replace(/[_-]+/g, ' ')
        .trim()
        .toUpperCase()
)

export default function AdminOrdersPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const { token } = useAuth()

    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [statusOptions, setStatusOptions] = useState(DEFAULT_ORDER_STATUSES)
    const [newStatus, setNewStatus] = useState('')

    const fetchOrders = useCallback(async () => {
        if (!token) return
        setLoading(true)
        try {
            const response = await fetchAdminOrdersApi(token, { per_page: 100 })
            setOrders(response.orders)
            setStatusOptions((currentOptions) => {
                const discoveredStatuses = response.orders
                    .map((order) => normalizeStatusInput(order.statusRaw || order.status))
                    .filter(Boolean)

                return Array.from(new Set([...DEFAULT_ORDER_STATUSES, ...currentOptions, ...discoveredStatuses]))
            })
        } catch (error) {
            toast.error(error.message || 'Failed to load orders.')
        } finally {
            setLoading(false)
        }
    }, [token])

    const updateStatus = async (orderId, status) => {
        await updateAdminOrderStatusApi(token, orderId, normalizeStatusInput(status))
        await fetchOrders()
    }

    const addCustomStatus = () => {
        const normalizedStatus = normalizeStatusInput(newStatus)

        if (normalizedStatus.length < 2) {
            toast.error('Status must have at least 2 letters or numbers.')
            return
        }

        if (statusOptions.includes(normalizedStatus)) {
            toast.error('This status already exists.')
            return
        }

        setStatusOptions((currentOptions) => [...currentOptions, normalizedStatus])
        setNewStatus('')
        toast.success(`Added status: ${toStatusLabel(normalizedStatus)}`)
    }

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const summary = useMemo(() => ({
        total: orders.length,
        paid: orders.filter((order) => order.paymentStatus === 'PAID').length,
        pending: orders.filter((order) => (order.status || '').toUpperCase() === 'PENDING').length,
    }), [orders])

    if (loading) return <Loading label="Loading orders..." />

    return (
        <div className="space-y-6">
            <header className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                <h1 className="text-2xl font-bold">Order Operations</h1>
                <p className="mt-1 text-sm text-slate-300">Track payments, fulfillment state, and update order statuses.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-800 px-3 py-1">Total: {summary.total}</span>
                    <span className="rounded-full bg-emerald-700 px-3 py-1">Paid: {summary.paid}</span>
                    <span className="rounded-full bg-amber-600 px-3 py-1">Pending: {summary.pending}</span>
                </div>
            </header>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Custom Status Manager</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <input
                        value={newStatus}
                        onChange={(event) => setNewStatus(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault()
                                addCustomStatus()
                            }
                        }}
                        placeholder="Example: Out for delivery"
                        className="min-w-72 flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                    />
                    <button
                        type="button"
                        onClick={addCustomStatus}
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Add status
                    </button>
                </div>
            </section>

            <section className="grid gap-3">
                {orders.map((order) => (
                    <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:items-center">
                            <div>
                                <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
                                <p className="mt-1 text-sm text-slate-700">{order.customer.name}</p>
                                <p className="text-xs text-slate-500">{order.customer.email}</p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total</p>
                                <p className="mt-1 font-semibold text-slate-800">{currency}{Number(order.total).toLocaleString()}</p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Payment</p>
                                <p className="mt-1 text-sm text-slate-800">{order.paymentMethod}</p>
                                <p className="text-xs text-slate-500">{order.paymentStatus}</p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Status</p>
                                <select
                                    value={normalizeStatusInput(order.statusRaw || order.status)}
                                    onChange={(event) =>
                                        toast.promise(updateStatus(order.id, event.target.value), { loading: 'Updating status...' })
                                    }
                                    className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-600"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>{toStatusLabel(status)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Created</p>
                                <p className="mt-1 text-sm text-slate-700">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </article>
                ))}
                {orders.length === 0 && (
                    <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                        No orders found.
                    </article>
                )}
            </section>
        </div>
    )
}
