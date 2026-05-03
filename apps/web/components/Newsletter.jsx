const Newsletter = () => {
    return (
        <section className='bg-white py-16'>
            <div className='container-electronics text-center'>
                <h2 className='text-3xl font-extrabold uppercase tracking-wide text-slate-900 sm:text-4xl'>Join our newsletter</h2>
                <p className='mx-auto mt-3 max-w-xl text-sm text-slate-600'>
                    Get product drops, exclusive offers, and latest tech updates.
                </p>

                <form className='mx-auto mt-8 flex w-full max-w-2xl flex-col gap-2 sm:flex-row'>
                    <input
                        className='w-full border border-slate-300 px-4 py-3 outline-none focus:border-blue-600'
                        type="email"
                        placeholder='Enter your email address'
                    />
                    <button className='bg-blue-600 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-blue-700'>
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    )
}

export default Newsletter
