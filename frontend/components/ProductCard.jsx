'use client'

import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const rating = product.rating?.length
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0

    return (
        <Link href={`/product/${product.id}`} className='group block w-full max-w-[260px]'>
            <div className='flex h-64 items-center justify-center border border-slate-200 bg-white p-4'>
                <Image
                    width={500}
                    height={500}
                    className='h-44 w-auto transition duration-300 group-hover:scale-105'
                    src={product.images?.[0] || '/product_placeholder.jpg'}
                    alt={product.name}
                />
            </div>

            <div className='mt-3 text-slate-800'>
                <p className='text-xs uppercase tracking-[0.18em] text-blue-600'>{product.category || 'Electronics'}</p>
                <h3 className='mt-1 min-h-12 text-base font-semibold leading-6'>{product.name}</h3>

                <div className='mt-2 flex items-center justify-between'>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent' fill={rating >= index + 1 ? "#2563EB" : "#CBD5E1"} />
                        ))}
                    </div>
                    <p className='text-lg font-bold'>{currency}{product.price}</p>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
