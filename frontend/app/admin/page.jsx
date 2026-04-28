'use client'

import { useAuth } from "@/app/AuthProvider"
import Loading from "@/components/Loading"
import { fetchAdminDashboardStatsApi } from "@/lib/shopApi"
import { CircleDollarSignIcon, ShoppingBagIcon, Users2Icon } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

const statusTone = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-violet-100 text-violet-800',
    cancelled: 'bg-rose-100 text-rose-700',
    refunded: 'bg-slate-200 text-slate-700',
}

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const { token } = useAuth()

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        statusBreakdown: {},
        latestOrders: [],
    })

    useEffect(() => {
        const loadStats = async () => {
            if (!token) return
            setLoading(true)
            try {
                const data = await fetchAdminDashboardStatsApi(token)
                setStats(data)
            } catch (error) {
                toast.error(error.message || 'Failed to load dashboard stats.')
            } finally {
                setLoading(false)
            }
        }

        loadStats()
    }, [token])

    const cards = useMemo(() => ([
        {
            title: 'Revenue',
            value: `${currency}${Number(stats.totalSales).toLocaleString()}`,
            icon: CircleDollarSignIcon,
        },
        {
            title: 'Orders',
            value: Number(stats.totalOrders).toLocaleString(),
            icon: ShoppingBagIcon,
        },
        {
            title: 'Customers',
            value: Number(stats.totalUsers).toLocaleString(),
            icon: Users2Icon,
        },
    ]), [currency, stats.totalOrders, stats.totalSales, stats.totalUsers])

    const totalStatusCount = Math.max(
        Object.values(stats.statusBreakdown || {}).reduce((acc, count) => acc + Number(count || 0), 0),
        1,
    )

    const statusEntries = Object.entries(stats.statusBreakdown || {})

    if (loading) return <Loading label="Loading dashboard..." />

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-lg">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Admin Dashboard</p>
                        <h1 className="mt-2 text-3xl font-extrabold">Operations Overview</h1>
                        <p className="mt-2 text-sm text-blue-100">A single view of store performance, activity, and customer demand.</p>
                    </div>
                    <Link href="/admin/orders" className="rounded bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                        Manage Orders
                    </Link>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                {cards.map((card) => (
                    <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{card.title}</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                            </div>
                            <div className="rounded-lg bg-blue-600 p-2 text-white">
                                <card.icon size={20} />
                            </div>
                        </div>
                    </article>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_1.4fr]">
                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">Status Distribution</h2>
                    <div className="mt-4 space-y-3">
                        {statusEntries.map(([status, count]) => {
                            const numericCount = Number(count || 0)
                            const percent = Math.max(Math.round((numericCount / totalStatusCount) * 100), 1)
                            return (
                                <div key={status}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="capitalize text-slate-700">{status}</span>
                                        <span className="font-semibold text-slate-800">{numericCount}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded bg-slate-100">
                                        <div className="h-full rounded bg-blue-600" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                        {statusEntries.length === 0 && (
                            <p className="text-sm text-slate-400">No status data available.</p>
                        )}
                    </div>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">Latest Orders</h2>
                    <div className="mt-4 space-y-3">
                        {stats.latestOrders.map((order) => (
                            <div key={order.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[(order.status || '').toLowerCase()] || 'bg-slate-200 text-slate-700'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-700">{order.customer.name}</p>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                                    <span className="font-semibold text-slate-800">{currency}{Number(order.total).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                        {stats.latestOrders.length === 0 && (
                            <p className="text-sm text-slate-400">No orders yet.</p>
                        )}
                    </div>
                </article>
            </section>
        </div>
    )
}
