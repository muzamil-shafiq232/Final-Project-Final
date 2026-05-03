'use client'

import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LatestProducts = () => {
    const products = useSelector((state) => state.product.list)
    const latestProducts = products
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8)

    return (
        <section className='bg-blue-600 py-16'>
            <div className='container-electronics'>
                <h2 className='text-center text-3xl font-extrabold uppercase tracking-wide text-white sm:text-4xl'>Featured Products</h2>
                <p className='mx-auto mt-3 max-w-2xl text-center text-sm text-blue-100'>
                    Handpicked electronics from your live backend catalog.
                </p>

                <div className='mt-10 grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    {latestProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default LatestProducts
