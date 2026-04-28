'use client'

import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')

    return (
        <div className="my-16 text-sm text-slate-600">
            <div className="mb-6 flex border-b border-slate-200">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button
                        className={`${tab === selectedTab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'} px-4 py-3 text-sm font-bold uppercase tracking-wide`}
                        key={index}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {selectedTab === "Description" && (
                <p className="max-w-3xl leading-7">{product.description}</p>
            )}

            {selectedTab === "Reviews" && (
                <div className="mt-8 flex flex-col gap-6">
                    {(product.rating || []).map((item, index) => (
                        <div key={index} className="flex gap-4 border border-slate-200 bg-white p-4">
                            <Image src={item.user.image} alt="" className="h-10 w-10 rounded-full" width={100} height={100} />
                            <div>
                                <div className="flex items-center">
                                    {Array(5).fill('').map((_, starIndex) => (
                                        <StarIcon key={starIndex} size={16} className='text-transparent' fill={item.rating >= starIndex + 1 ? "#2563EB" : "#CBD5E1"} />
                                    ))}
                                </div>
                                <p className="my-3 max-w-2xl">{item.review}</p>
                                <p className="font-semibold text-slate-900">{item.user.name}</p>
                                <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{new Date(item.createdAt).toDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-10 flex items-center gap-3 border border-slate-200 bg-slate-50 p-4">
                <Image src={product.store?.logo || '/favicon.ico'} alt="" className="h-11 w-11 rounded-full border border-slate-300" width={100} height={100} />
                <div>
                    <p className="font-semibold text-slate-800">Product by {product.store?.name || 'Singitronic'}</p>
                    <Link href={`/shop/${product.store?.username || 'singitronic'}`} className="mt-1 inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
                        view store <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
