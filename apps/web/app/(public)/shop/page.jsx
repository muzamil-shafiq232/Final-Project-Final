'use client'

import { Suspense, useEffect, useMemo, useState } from "react"
import ProductCard from "@/components/ProductCard"
import Loading from "@/components/Loading"
import { useRouter, useSearchParams } from "next/navigation"
import { fetchCategoriesApi, fetchProductsApi } from "@/lib/shopApi"

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const selectedCategory = searchParams.get('category')
    const router = useRouter()

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState('latest')

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    fetchProductsApi({
                        per_page: 50,
                        search: search || undefined,
                        category_slug: selectedCategory || undefined,
                    }),
                    fetchCategoriesApi(),
                ])
                setProducts(productsResponse.products)
                setCategories(categoriesResponse)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [search, selectedCategory])

    const sortedProducts = useMemo(() => {
        const list = [...products]
        if (sortBy === 'price_asc') {
            return list.sort((a, b) => Number(a.price) - Number(b.price))
        }
        if (sortBy === 'price_desc') {
            return list.sort((a, b) => Number(b.price) - Number(a.price))
        }
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }, [products, sortBy])

    const setCategoryInQuery = (categorySlug) => {
        const params = new URLSearchParams(searchParams.toString())
        if (categorySlug) {
            params.set('category', categorySlug)
        } else {
            params.delete('category')
        }
        const query = params.toString()
        router.push(query ? `/shop?${query}` : '/shop')
    }

    return (
        <section className="bg-white">
            <div className="container-electronics py-10">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Home / Shop</p>
                <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-wide text-slate-900">
                    {search ? `Search: ${search}` : selectedCategory ? selectedCategory : 'All Products'}
                </h1>

                <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
                    <aside className="h-fit border border-slate-200 bg-slate-50 p-5">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-blue-600">Categories</h2>
                        <div className="mt-3 flex flex-col gap-2 text-sm">
                            <button
                                onClick={() => setCategoryInQuery('')}
                                className={`px-3 py-2 text-left font-medium ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:text-blue-600'}`}
                            >
                                All Categories
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setCategoryInQuery(category.slug)}
                                    className={`px-3 py-2 text-left font-medium ${selectedCategory === category.slug ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:text-blue-600'}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </aside>

                    <div>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                            <p className="text-sm text-slate-600">{sortedProducts.length} products</p>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                            >
                                <option value="latest">Latest</option>
                                <option value="price_asc">Price: low to high</option>
                                <option value="price_desc">Price: high to low</option>
                            </select>
                        </div>

                        {loading ? (
                            <Loading fullScreen={false} label="Loading products..." />
                        ) : sortedProducts.length === 0 ? (
                            <div className="border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                                No products found.
                            </div>
                        ) : (
                            <div className="grid justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {sortedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<Loading fullScreen={false} label="Loading shop..." />}>
            <ShopContent />
        </Suspense>
    );
}
