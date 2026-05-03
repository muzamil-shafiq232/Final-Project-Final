'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, PackagePlusIcon, ShoppingBagIcon, TagIcon, Users2Icon, MailIcon } from "lucide-react"
import Link from "next/link"

const AdminSidebar = () => {
    const pathname = usePathname()
    const normalizedPathname = pathname?.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : (pathname || '')

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
        { name: 'Products', href: '/admin/products', icon: PackagePlusIcon },
        { name: 'Categories', href: '/admin/categories', icon: TagIcon },
        { name: 'Users', href: '/admin/users', icon: Users2Icon },
        { name: 'Contact', href: '/admin/contact-messages', icon: MailIcon },
    ]

    return (
        <aside className="hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
            <div className="border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-6 text-white">
                <Link href="/admin" className="text-2xl font-extrabold tracking-tight">
                    Singitronic
                </Link>
                <p className="mt-1 text-xs text-blue-100">Admin Console</p>
            </div>

            <div className="space-y-1 p-3">
                {sidebarLinks.map((link) => {
                    const isActive =
                        link.href === '/admin'
                            ? normalizedPathname === '/admin'
                            : normalizedPathname === link.href || normalizedPathname.startsWith(`${link.href}/`)

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                        >
                            <link.icon size={18} />
                            <span>{link.name}</span>
                        </Link>
                    )
                })}
            </div>
        </aside>
    )
}

export default AdminSidebar
