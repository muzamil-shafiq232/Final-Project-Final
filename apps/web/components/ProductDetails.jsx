'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { useAuth } from "@/app/AuthProvider";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const ProductDetails = ({ product }) => {
    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const cart = useSelector((state) => state.cart.cartItems);
    const { token } = useAuth();
    const dispatch = useDispatch();
    const router = useRouter();

    const [mainImage, setMainImage] = useState(product.images[0]);

    const addToCartHandler = async () => {
        if (!token) {
            toast.error('Please login as customer to add items.');
            router.push('/login?redirect=/cart');
            return;
        }
        try {
            await dispatch(addToCart({ token, productId })).unwrap();
        } catch (error) {
            toast.error(error || 'Unable to add item to cart.');
        }
    };

    const averageRating = product.rating?.length
        ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
        : 0;

    return (
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="flex gap-3 max-sm:flex-col-reverse">
                <div className="flex gap-2 sm:flex-col">
                    {product.images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setMainImage(product.images[index])}
                            className="flex h-20 w-20 items-center justify-center border border-slate-200 bg-white p-2"
                        >
                            <Image src={image} className="h-14 w-auto" alt="" width={60} height={60} />
                        </button>
                    ))}
                </div>
                <div className="flex h-[420px] flex-1 items-center justify-center border border-slate-200 bg-white p-6">
                    <Image src={mainImage} alt="" width={320} height={320} className="h-72 w-auto" />
                </div>
            </div>

            <div>
                <h1 className="text-3xl font-bold uppercase tracking-wide text-slate-900">{product.name}</h1>
                <div className='mt-3 flex items-center'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={16} className='text-transparent' fill={averageRating >= index + 1 ? "#2563EB" : "#CBD5E1"} />
                    ))}
                    <p className="ml-3 text-sm text-slate-500">{product.rating.length} Reviews</p>
                </div>

                <div className="my-6 flex items-center gap-3 text-3xl font-bold text-slate-900">
                    <p>{currency}{product.price}</p>
                    <p className="text-lg font-medium text-slate-400 line-through">{currency}{product.mrp}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <TagIcon size={14} className="text-blue-600" />
                    <p>Save {product.mrp ? ((product.mrp - product.price) / product.mrp * 100).toFixed(0) : 0}% today</p>
                </div>

                <div className="mt-8 flex items-end gap-5">
                    {cart[productId] && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Quantity</p>
                            <Counter productId={productId} />
                        </div>
                    )}

                    <button
                        onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')}
                        className="bg-blue-600 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-blue-700"
                    >
                        {!cart[productId] ? 'Add to Cart' : 'View Cart'}
                    </button>
                </div>

                <div className="mt-8 space-y-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><EarthIcon size={16} className="text-blue-600" /> Free shipping worldwide</p>
                    <p className="flex items-center gap-2"><CreditCardIcon size={16} className="text-blue-600" /> Secure payment</p>
                    <p className="flex items-center gap-2"><UserIcon size={16} className="text-blue-600" /> Trusted customer support</p>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
