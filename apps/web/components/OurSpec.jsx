import Image from "next/image";
import Link from "next/link";

const categories = [
    { title: 'Laptops', icon: '/laptop-icon.png', query: 'laptop' },
    { title: 'Headphones', icon: '/headphone-icon.png', query: 'headphone' },
    { title: 'Smartphones', icon: '/phone-icon.png', query: 'phone' },
    { title: 'Tablets', icon: '/tablet-icon.png', query: 'tablet' },
    { title: 'Smart Watches', icon: '/smart-watch.png', query: 'watch' },
];

const OurSpecs = () => {
    return (
        <section className='bg-blue-600 py-14'>
            <div className='container-electronics'>
                <h2 className='text-center text-2xl font-extrabold uppercase tracking-wide text-white sm:text-3xl'>Browse Categories</h2>
                <div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
                    {categories.map((category) => (
                        <Link
                            key={category.title}
                            href={`/shop?search=${encodeURIComponent(category.query)}`}
                            className='flex items-center gap-3 border border-blue-400 bg-white px-4 py-4 text-slate-800 hover:-translate-y-0.5 hover:shadow-md'
                        >
                            <Image src={category.icon} alt={category.title} width={32} height={32} className='h-8 w-8 object-contain' />
                            <span className='text-sm font-semibold uppercase tracking-wide'>{category.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default OurSpecs
