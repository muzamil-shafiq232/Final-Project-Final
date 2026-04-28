'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { fetchCustomerOrdersApi } from "@/lib/shopApi"
import { useAuth } from "@/app/AuthProvider"
import toast from "react-hot-toast"
import Image from "next/image"

export default function StoreOrders() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const { token } = useAuth()

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) return
            setLoading(true)
            try {
                const response = await fetchCustomerOrdersApi(token)
                setOrders(response)
            } catch (error) {
                toast.error(error.message || 'Failed to fetch orders.')
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [token])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">My <span className="text-slate-800 font-medium">Orders</span></h1>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className="space-y-4 max-w-4xl">
                    {orders.map((order) => (
                        <div key={order.id} className="rounded-lg border border-slate-200 bg-white p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-sm">
                                <p><span className="text-slate-500">Order:</span> <span className="font-medium text-slate-700">{order.id}</span></p>
                                <p><span className="text-slate-500">Status:</span> <span className="font-medium text-slate-700">{order.status}</span></p>
                                <p><span className="text-slate-500">Total:</span> <span className="font-medium text-slate-700">{currency}{Number(order.total).toLocaleString()}</span></p>
                                <p className="text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="mt-3 space-y-2">
                                {order.orderItems.map((item, index) => (
                                    <div key={`${order.id}-${index}`} className="flex items-center gap-3 text-sm text-slate-600">
                                        <Image
                                            src={item.product.images?.[0] || '/favicon.ico'}
                                            alt={item.product.name}
                                            width={52}
                                            height={52}
                                            className="rounded bg-slate-100 p-1"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-700">{item.product.name}</p>
                                            <p>Qty: {item.quantity}</p>
                                        </div>
                                        <p>{currency}{Number(item.price).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}

