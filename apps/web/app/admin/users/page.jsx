'use client'

import { useAuth } from "@/app/AuthProvider"
import Loading from "@/components/Loading"
import { fetchAdminUsersApi, updateAdminUserApi } from "@/lib/shopApi"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminUsersPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const { token } = useAuth()

    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [editingUserId, setEditingUserId] = useState(null)
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        is_active: true,
    })

    const loadUsers = useCallback(async () => {
        if (!token) return
        setLoading(true)
        try {
            const response = await fetchAdminUsersApi(token, { per_page: 100 })
            setUsers(response.users)
        } catch (error) {
            toast.error(error.message || 'Failed to load users.')
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    const startEditUser = (user) => {
        setEditingUserId(user.id)
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            is_active: Boolean(user.is_active),
        })
    }

    const cancelEditUser = () => {
        setEditingUserId(null)
        setEditForm({
            name: '',
            email: '',
            phone: '',
            is_active: true,
        })
    }

    const saveUser = async (userId) => {
        await updateAdminUserApi(token, userId, editForm)
        cancelEditUser()
        await loadUsers()
    }

    if (loading) return <Loading label="Loading users..." />

    return (
        <div className="space-y-6">
            <header className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                <h1 className="text-2xl font-bold">Customers</h1>
                <p className="mt-1 text-sm text-blue-100">Manage customer accounts, phone/email details, and activation status.</p>
            </header>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {users.map((user) => (
                    <article key={user.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        {editingUserId === user.id ? (
                            <div className="space-y-3">
                                <input
                                    value={editForm.name}
                                    onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                                    placeholder="Name"
                                />
                                <input
                                    value={editForm.email}
                                    onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                                    placeholder="Email"
                                />
                                <input
                                    value={editForm.phone}
                                    onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                                    placeholder="Phone"
                                />
                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={editForm.is_active}
                                        onChange={(event) => setEditForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                                        className="accent-blue-600"
                                    />
                                    Active user
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toast.promise(saveUser(user.id), { loading: 'Saving user...' })}
                                        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEditUser}
                                        className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-base font-semibold text-slate-900">{user.name}</p>
                                        <p className="text-sm text-slate-600">{user.email}</p>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                    <div className="rounded border border-slate-200 bg-slate-50 p-2">
                                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Orders</p>
                                        <p className="mt-1 font-semibold text-slate-800">{user.orders_count}</p>
                                    </div>
                                    <div className="rounded border border-slate-200 bg-slate-50 p-2">
                                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Spent</p>
                                        <p className="mt-1 font-semibold text-slate-800">{currency}{Number(user.total_spent).toLocaleString()}</p>
                                    </div>
                                </div>

                                <p className="mt-3 text-sm text-slate-600">Phone: {user.phone || '-'}</p>
                                <p className="text-xs text-slate-500">Joined: {new Date(user.created_at).toLocaleDateString()}</p>

                                <button
                                    onClick={() => startEditUser(user)}
                                    className="mt-4 rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                                >
                                    Edit account
                                </button>
                            </>
                        )}
                    </article>
                ))}
                {users.length === 0 && (
                    <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
                        No users found.
                    </article>
                )}
            </section>
        </div>
    )
}
