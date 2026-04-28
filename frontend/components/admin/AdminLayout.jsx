'use client'
import { useCallback, useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { useAuth } from "@/app/AuthProvider"
import { apiRequest } from "@/lib/apiClient"

const AdminLayout = ({ children }) => {

    const { token } = useAuth()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchIsAdmin = useCallback(async () => {
        if (!token) {
            setIsAdmin(false)
            setLoading(false)
            return
        }

        try {
            await apiRequest('/admin/profile', {
                method: 'GET',
                token,
            })
            setIsAdmin(true)
        } catch {
            setIsAdmin(false)
        }
        setLoading(false)
    }, [token])

    useEffect(() => {
        fetchIsAdmin()
    }, [fetchIsAdmin])

    return loading ? (
        <Loading label="Preparing admin workspace..." />
    ) : isAdmin ? (
        <div className="flex h-screen overflow-hidden bg-[#f4f7ff]">
            <AdminSidebar />
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <AdminNavbar />
                <div className="p-4 md:p-6">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-500 sm:text-4xl">You are not authorized to access this page</h1>
            <Link href="/login?redirect=/admin" className="mt-8 flex items-center gap-2 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 max-sm:text-sm">
                Login <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default AdminLayout
