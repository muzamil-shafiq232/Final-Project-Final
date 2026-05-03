'use client'

import { Headphones, Mail, MapPin, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "@/app/AuthProvider";

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [search, setSearch] = useState('');
    const cartCount = useSelector((state) => state.cart.total);
    const { isAuthenticated, isAdmin, user, logout, submitting } = useAuth();

    const handleSearch = (e) => {
        e.preventDefault();
        const term = search.trim();
        if (!term) {
            return;
        }
        router.push(`/shop?search=${encodeURIComponent(term)}`);
        setSearch('');
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/shop', label: 'Shop' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
            <div className="bg-blue-600 text-xs text-white">
                <div className="container-electronics flex flex-wrap items-center justify-between gap-2 py-2">
                    <div className="flex items-center gap-4">
                        <span className="hidden items-center gap-1.5 sm:flex"><Headphones size={12} /> +1-212-456-7890</span>
                        <span className="hidden items-center gap-1.5 md:flex"><Mail size={12} /> support@singitronic.com</span>
                    </div>
                    <span className="hidden items-center gap-1.5 sm:flex"><MapPin size={12} /> New York, US</span>
                </div>
            </div>

            <div className="container-electronics py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link href="/" className="inline-flex items-center">
                        <Image src="/logo-v1.svg" width={210} height={52} alt="Singitronic logo" className="h-11 w-auto" />
                    </Link>

                    <form
                        onSubmit={handleSearch}
                        className="order-3 flex w-full items-center border border-slate-300 bg-slate-50 text-sm md:order-none md:max-w-xl"
                    >
                        <input
                            className="w-full bg-transparent px-4 py-2.5 outline-none"
                            type="text"
                            placeholder="Search electronics..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="flex items-center gap-1 bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">
                            <Search size={16} />
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-3 text-sm">
                        <Link href="/cart" className="relative flex items-center gap-2 font-medium text-slate-700 hover:text-blue-600">
                            <ShoppingCart size={18} />
                            Cart
                            <span className="absolute -top-2 left-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
                                {cartCount}
                            </span>
                        </Link>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={isAdmin ? "/admin" : "/orders"}
                                    className="hidden rounded border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:border-blue-600 hover:text-blue-600 sm:inline-block"
                                >
                                    {isAdmin ? "Admin" : user?.name?.split(' ')[0] || 'Account'}
                                </Link>
                                <button
                                    onClick={logout}
                                    disabled={submitting}
                                    className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="rounded border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:border-blue-600 hover:text-blue-600">
                                    Login
                                </Link>
                                <Link href="/register" className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="mt-4 hidden items-center gap-8 border-t border-slate-200 pt-3 text-sm font-semibold uppercase tracking-wide text-slate-600 md:flex">
                    {navLinks.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={pathname === item.href ? 'text-blue-600' : 'hover:text-blue-600'}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
