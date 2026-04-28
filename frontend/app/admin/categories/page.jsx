'use client'

import { useCallback, useEffect, useState } from "react"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import { useAuth } from "@/app/AuthProvider"
import {
    createAdminCategoryApi,
    deleteAdminCategoryApi,
    fetchAdminCategoriesApi,
    updateAdminCategoryApi,
} from "@/lib/shopApi"

export default function AdminCategoriesPage() {
    const { token } = useAuth()
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [editingCategoryId, setEditingCategoryId] = useState(null)
    const [editName, setEditName] = useState('')
    const [editDescription, setEditDescription] = useState('')

    const fetchCategories = useCallback(async () => {
        if (!token) return
        setLoading(true)
        try {
            const data = await fetchAdminCategoriesApi(token)
            setCategories(data)
        } catch (error) {
            toast.error(error.message || 'Failed to load categories.')
        } finally {
            setLoading(false)
        }
    }, [token])

    const createCategory = async () => {
        await createAdminCategoryApi(token, { name, description })
        setName('')
        setDescription('')
        await fetchCategories()
    }

    const toggleCategory = async (category) => {
        await updateAdminCategoryApi(token, category.id, {
            is_active: !category.is_active,
        })
        await fetchCategories()
    }

    const removeCategory = async (categoryId) => {
        await deleteAdminCategoryApi(token, categoryId)
        await fetchCategories()
    }

    const startEditCategory = (category) => {
        setEditingCategoryId(category.id)
        setEditName(category.name || '')
        setEditDescription(category.description || '')
    }

    const cancelEditCategory = () => {
        setEditingCategoryId(null)
        setEditName('')
        setEditDescription('')
    }

    const saveCategoryEdit = async (categoryId) => {
        await updateAdminCategoryApi(token, categoryId, {
            name: editName,
            description: editDescription,
        })
        cancelEditCategory()
        await fetchCategories()
    }

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    if (loading) return <Loading label="Loading categories..." />

    return (
        <div className="space-y-6">
            <header className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                <h1 className="text-2xl font-bold">Category Studio</h1>
                <p className="mt-1 text-sm text-slate-300">Create and curate product categories used in your storefront catalog.</p>
            </header>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <form
                    onSubmit={(event) => {
                        event.preventDefault()
                        toast.promise(createCategory(), { loading: 'Creating category...' })
                    }}
                    className="grid gap-3 lg:grid-cols-[1fr_1.5fr_auto]"
                >
                    <input
                        type="text"
                        className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Category name"
                        required
                    />
                    <input
                        type="text"
                        className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Optional description"
                    />
                    <button className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        Add category
                    </button>
                </form>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                    <article key={category.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        {editingCategoryId === category.id ? (
                            <div className="space-y-3">
                                <input
                                    value={editName}
                                    onChange={(event) => setEditName(event.target.value)}
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                                />
                                <input
                                    value={editDescription}
                                    onChange={(event) => setEditDescription(event.target.value)}
                                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
                                    placeholder="Description"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toast.promise(saveCategoryEdit(category.id), { loading: 'Saving category...' })}
                                        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEditCategory}
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
                                        <p className="text-base font-semibold text-slate-900">{category.name}</p>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{category.slug}</p>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${category.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="mt-3 min-h-10 text-sm text-slate-600">{category.description || 'No description provided.'}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => startEditCategory(category)}
                                        className="rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => toast.promise(toggleCategory(category), { loading: 'Updating status...' })}
                                        className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        Toggle status
                                    </button>
                                    <button
                                        onClick={() => toast.promise(removeCategory(category.id), { loading: 'Deleting category...' })}
                                        className="rounded border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </article>
                ))}

                {categories.length === 0 && (
                    <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
                        No categories found.
                    </article>
                )}
            </section>
        </div>
    )
}
