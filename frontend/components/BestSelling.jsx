'use client'

import Link from 'next/link'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = () => {
    const products = useSelector((state) => state.product.list)

    const topProducts = products
        .slice()
        .sort((a, b) => (b.rating?.length || 0) - (a.rating?.length || 0))
        .slice(0, 8)

    return (
        <section className='bg-white py-16'>
            <div className='container-electronics'>
                <div className='mb-8 flex items-center justify-between gap-3'>
                    <h2 className='text-2xl font-extrabold uppercase tracking-wide text-slate-900 sm:text-3xl'>Top Rated</h2>
                    <Link href="/shop" className='text-sm font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-700'>
                        View all
                    </Link>
                </div>

                <div className='grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    {topProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default BestSelling
