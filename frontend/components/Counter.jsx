'use client'

import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useAuth } from "@/app/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const Counter = ({ productId }) => {
    const { cartItems } = useSelector((state) => state.cart);
    const { token } = useAuth();
    const dispatch = useDispatch();

    const addToCartHandler = async () => {
        if (!token) {
            toast.error('Please login as customer to manage cart.');
            return;
        }
        try {
            await dispatch(addToCart({ token, productId })).unwrap();
        } catch (error) {
            toast.error(error || 'Unable to add item to cart.');
        }
    };

    const removeFromCartHandler = async () => {
        if (!token) {
            toast.error('Please login as customer to manage cart.');
            return;
        }
        try {
            await dispatch(removeFromCart({ token, productId })).unwrap();
        } catch (error) {
            toast.error(error || 'Unable to update cart item.');
        }
    };

    return (
        <div className="inline-flex items-center border border-slate-300 bg-white text-sm text-slate-700">
            <button onClick={removeFromCartHandler} className="px-3 py-2 hover:bg-slate-100">-</button>
            <p className="min-w-8 px-2 py-2 text-center font-semibold">{cartItems[productId]}</p>
            <button onClick={addToCartHandler} className="px-3 py-2 hover:bg-slate-100">+</button>
        </div>
    )
}

export default Counter
