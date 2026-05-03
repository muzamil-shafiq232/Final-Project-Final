'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import ProductCard from './ProductCard'
import Title from './Title'

const ProductSlider = () => {
    const scrollRef = useRef(null)
    const products = useSelector((state) => state.product.list)

    const featuredProducts = useMemo(
        () => products
            .slice()
            .sort((a, b) => (b.rating?.length || 0) - (a.rating?.length || 0))
            .slice(0, 12),
        [products],
    )

    const handleScroll = (direction) => {
        if (!scrollRef.current) {
            return
        }

        const viewport = scrollRef.current.clientWidth
        const offset = Math.max(viewport * 0.85, 280)
        scrollRef.current.scrollBy({
            left: direction * offset,
            behavior: 'smooth',
        })
    }

    if (featuredProducts.length === 0) {
        return null
    }

    return (
        <section className="px-6 my-30 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <Title
                    title="Trending Picks"
                    description={`Slide through ${featuredProducts.length} curated products`}
                    href="/shop"
                    align="left"
                />
                <div className="ml-auto hidden items-center gap-2 sm:flex">
                    <button
                        type="button"
                        onClick={() => handleScroll(-1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleScroll(1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {featuredProducts.map((product) => (
                    <div key={product.id} className="snap-start shrink-0">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default ProductSlider
