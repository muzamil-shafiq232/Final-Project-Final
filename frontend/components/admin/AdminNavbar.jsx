'use client'

import { useAuth } from "@/app/AuthProvider"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const AdminNavbar = () => {
    const { user, logout, submitting } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    const currentSection = pathname
        ?.replace('/admin', '')
        .split('/')
        .filter(Boolean)
        .map((segment) => segment.replace(/-/g, ' '))
        .join(' / ') || 'dashboard'

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
                <div className="flex items-center gap-3">
                    <Image src="/logo-v1.png" width={120} height={38} alt="Singitronic" className="h-8 w-auto" />
                    <div className="hidden sm:block">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current Section</p>
                        <p className="text-sm font-semibold text-slate-800">{currentSection}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 md:inline-block">
                        {user?.name || 'Admin'}
                    </span>
                    <Link href="/" className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-blue-600 hover:text-blue-600">
                        Storefront
                    </Link>
                    <button
                        onClick={handleLogout}
                        disabled={submitting}
                        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}

export default AdminNavbar
