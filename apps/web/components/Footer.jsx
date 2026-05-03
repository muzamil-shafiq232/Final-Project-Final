import Image from "next/image";
import Link from "next/link";

const linkGroups = [
    {
        title: "Sale",
        links: [
            { name: "Laptops", href: "/shop?search=laptop" },
            { name: "Headphones", href: "/shop?search=headphones" },
            { name: "Smartphones", href: "/shop?search=phone" },
            { name: "Accessories", href: "/shop?search=accessories" },
        ],
    },
    {
        title: "About",
        links: [
            { name: "Home", href: "/" },
            { name: "Shop", href: "/shop" },
            { name: "Contact", href: "/contact" },
            { name: "My Orders", href: "/orders" },
        ],
    },
    {
        title: "Support",
        links: [
            { name: "Cart", href: "/cart" },
            { name: "Login", href: "/login" },
            { name: "Register", href: "/register" },
            { name: "Admin", href: "/admin" },
        ],
    },
];

const Footer = () => {
    return (
        <footer className="border-t border-slate-200 bg-white" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>

            <div className="container-electronics py-14">
                <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
                    <div>
                        <Image
                            src="/logo-v1.png"
                            alt="Singitronic logo"
                            width={220}
                            height={70}
                            className="h-auto w-auto"
                        />
                        <p className="mt-4 max-w-md text-sm text-slate-600">
                            Premium electronics storefront template integrated with your Laravel backend APIs.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-3">
                        {linkGroups.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-sm font-bold uppercase tracking-wide text-blue-600">{group.title}</h3>
                                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                                    {group.links.map((link) => (
                                        <li key={link.name}>
                                            <Link href={link.href} className="hover:text-blue-600">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
