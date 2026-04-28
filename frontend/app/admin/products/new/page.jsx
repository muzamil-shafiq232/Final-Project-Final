'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { assets } from "@/assets/assets"
import { useAuth } from "@/app/AuthProvider"
import { createAdminProductApi, fetchAdminCategoriesApi } from "@/lib/shopApi"

export default function AdminAddProductPage() {
    const router = useRouter()
    const { token } = useAuth()

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        compare_at_price: 0,
        price: 0,
        stock: 0,
        category_id: "",
    })

    useEffect(() => {
        const fetchCategories = async () => {
            if (!token) return
            const data = await fetchAdminCategoriesApi(token)
            setCategories(data.filter((category) => category.is_active))
        }
        fetchCategories()
    }, [token])

    const onChangeHandler = (event) => {
        setProductInfo({ ...productInfo, [event.target.name]: event.target.value })
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', productInfo.name)
            formData.append('description', productInfo.description)
            formData.append('compare_at_price', productInfo.compare_at_price || 0)
            formData.append('price', productInfo.price)
            formData.append('stock', productInfo.stock)
            formData.append('category_id', productInfo.category_id)

            Object.values(images).forEach((imageFile) => {
                if (imageFile) {
                    formData.append('images[]', imageFile)
                }
            })

            await createAdminProductApi(token, formData)
            router.replace('/admin/products')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <header className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
                <h1 className="text-2xl font-bold">Create Product</h1>
                <p className="mt-1 text-sm text-slate-300">Add a new product listing for your storefront catalog.</p>
            </header>

            <form onSubmit={(event) => toast.promise(onSubmitHandler(event), { loading: "Adding product..." })} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
                    <section className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-600">Images</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.keys(images).map((key) => (
                                <label key={key} htmlFor={`images${key}`} className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-3 hover:border-blue-300">
                                    <Image
                                        width={220}
                                        height={160}
                                        className='mx-auto h-24 w-auto object-contain'
                                        src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area}
                                        alt=""
                                    />
                                    <p className="mt-2 text-center text-xs text-slate-500">Image {key}</p>
                                    <input type="file" accept='image/*' id={`images${key}`} onChange={(event) => setImages({ ...images, [key]: event.target.files[0] })} hidden />
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-600">Details</h2>

                        <div className="space-y-3">
                            <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Product name" className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600" required />
                            <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Product description" rows={5} className="w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600" required />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <input type="number" step="0.01" name="compare_at_price" onChange={onChangeHandler} value={productInfo.compare_at_price} placeholder="MRP" className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600" />
                            <input type="number" step="0.01" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="Offer price" className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600" required />
                            <input type="number" name="stock" onChange={onChangeHandler} value={productInfo.stock} placeholder="Stock" className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600" required />
                        </div>

                        <select onChange={onChangeHandler} name="category_id" value={productInfo.category_id} className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600" required>
                            <option value="">Select category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>

                        <div className="flex flex-wrap gap-2">
                            <button disabled={loading} className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">Publish product</button>
                            <button type="button" onClick={() => router.push('/admin/products')} className="rounded border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                        </div>
                    </section>
                </div>
            </form>
        </div>
    )
}
