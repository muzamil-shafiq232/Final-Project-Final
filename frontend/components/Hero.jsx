import Image from "next/image";
import Link from "next/link";

const Hero = () => {
    return (
        <section className="bg-blue-600">
            <div className="container-electronics grid min-h-[620px] items-center gap-10 py-12 lg:grid-cols-[1.2fr_1fr]">
                <div className="text-white">
                    <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                        THE PRODUCT OF THE FUTURE
                    </h1>
                    <p className="mt-6 max-w-xl text-sm text-blue-100 sm:text-base">
                        Discover modern electronics with clean design, reliable performance, and unbeatable value.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/shop"
                            className="bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-blue-700 hover:bg-slate-100"
                        >
                            Shop now
                        </Link>
                        <Link
                            href="/contact"
                            className="border border-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-blue-700"
                        >
                            Learn more
                        </Link>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Image
                        src="/watch-banner.png"
                        width={430}
                        height={430}
                        alt="Smart watch hero image"
                        className="h-auto w-auto max-w-[320px] sm:max-w-[430px]"
                        priority
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
