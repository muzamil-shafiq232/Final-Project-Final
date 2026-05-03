'use client'
import Loading from "@/components/Loading"
import { fetchCustomerCartApi, fetchCustomerOrdersApi } from "@/lib/shopApi"
import { CircleDollarSignIcon, ShoppingBasketIcon, TagsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/app/AuthProvider"
import toast from "react-hot-toast"

export default function Dashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const { token } = useAuth()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        cartItems: 0,
        totalOrders: 0,
        totalSpent: 0,
        recentOrders: [],
    })

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return

            setLoading(true)
            try {
                const [orders, cart] = await Promise.all([
                    fetchCustomerOrdersApi(token),
                    fetchCustomerCartApi(token),
                ])

                const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)

                setDashboardData({
                    cartItems: cart?.total_items || 0,
                    totalOrders: orders.length,
                    totalSpent,
                    recentOrders: orders.slice(0, 5),
                })
            } catch (error) {
                toast.error(error.message || 'Failed to load dashboard.')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [token])

    if (loading) return <Loading />

    const dashboardCardsData = [
        { title: 'Items In Cart', value: dashboardData.cartItems, icon: ShoppingBasketIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Total Spent', value: `${currency}${dashboardData.totalSpent.toLocaleString()}`, icon: CircleDollarSignIcon },
    ]

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Customer <span className="text-slate-800 font-medium">Dashboard</span></h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className="w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <h2 className="text-xl text-slate-700">Recent Orders</h2>

            <div className="mt-5 max-w-4xl rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData.recentOrders.map((order) => (
                            <tr key={order.id} className="border-t border-slate-200">
                                <td className="px-4 py-3">{order.id}</td>
                                <td className="px-4 py-3">{order.status}</td>
                                <td className="px-4 py-3">{currency}{Number(order.total).toLocaleString()}</td>
                                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {dashboardData.recentOrders.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">No orders yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

