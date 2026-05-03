'use client'
import Link from "next/link"
import { useAuth } from "@/app/AuthProvider"
import { useRouter } from "next/navigation"

const StoreNavbar = () => {

    const { user, logout, submitting } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Store
                </p>
            </Link>
            <div className="flex items-center gap-3">
                <p>Hi, {user?.name || 'Customer'}</p>
                <button
                    onClick={handleLogout}
                    disabled={submitting}
                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-full"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default StoreNavbar
