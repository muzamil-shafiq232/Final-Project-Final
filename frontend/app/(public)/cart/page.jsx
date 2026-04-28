'use client'

import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { useAuth } from "@/app/AuthProvider";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function Cart() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const { token } = useAuth();
    const { lineItems, totalPrice } = useSelector((state) => state.cart);
    const dispatch = useDispatch();

    const handleDeleteItemFromCart = (productId) => {
        if (!token) {
            toast.error('Please login to manage your cart.');
            return;
        }
        dispatch(deleteItemFromCart({ token, productId }));
    };

    return lineItems.length > 0 ? (
        <section className="bg-white">
            <div className="container-electronics py-10">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Home / Cart</p>
                <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-wide text-slate-900">Shopping Cart</h1>

                <div className="mt-8 flex items-start justify-between gap-6 max-lg:flex-col">
                    <div className="w-full overflow-x-auto border border-slate-200">
                        <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3 text-center">Quantity</th>
                                    <th className="px-4 py-3 text-center">Price</th>
                                    <th className="px-4 py-3 text-center">Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((item, index) => (
                                    <tr key={index} className="border-t border-slate-200">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-18 w-18 items-center justify-center border border-slate-200 bg-white">
                                                    <Image src={item.product?.images?.[0] || '/product_placeholder.jpg'} alt="" width={60} height={60} className="h-14 w-auto" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{item.product?.name}</p>
                                                    <p className="text-xs uppercase tracking-wide text-blue-600">{item.product?.category?.name || item.product?.category || 'General'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Counter productId={item.id} />
                                        </td>
                                        <td className="px-4 py-4 text-center font-semibold">{currency}{(item.price * item.quantity).toLocaleString()}</td>
                                        <td className="px-4 py-4 text-center">
                                            <button onClick={() => handleDeleteItemFromCart(item.id)} className="p-2 text-slate-500 hover:text-red-600">
                                                <Trash2Icon size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <OrderSummary totalPrice={totalPrice} items={lineItems} />
                </div>
            </div>
        </section>
    ) : (
        <section className="bg-white">
            <div className="container-electronics flex min-h-[60vh] items-center justify-center py-12 text-slate-500">
                <h1 className="text-2xl font-semibold sm:text-4xl">Your cart is empty</h1>
            </div>
        </section>
    );
}
