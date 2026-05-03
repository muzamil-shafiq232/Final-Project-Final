'use client'
import { useCallback, useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { useAuth } from "@/app/AuthProvider"
import { apiRequest } from "@/lib/apiClient"

const StoreLayout = ({ children }) => {


    const { token } = useAuth()
    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)

    const fetchIsSeller = useCallback(async () => {
        if (!token) {
            setIsSeller(false)
            setLoading(false)
            return
        }

        try {
            const response = await apiRequest('/customer/profile', {
                method: 'GET',
                token,
            })
            setIsSeller(true)
            setStoreInfo({
                logo: '/favicon.ico',
                name: response.data?.name || 'Customer',
            })
        } catch {
            setIsSeller(false)
        }
        setLoading(false)
    }, [token])

    useEffect(() => {
        fetchIsSeller()
    }, [fetchIsSeller])

    return loading ? (
        <Loading />
    ) : isSeller ? (
        <div className="flex flex-col h-screen">
            <SellerNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar storeInfo={storeInfo} />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
            <Link href="/login?redirect=/store" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                Login <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default StoreLayout
