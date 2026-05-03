'use client'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { clearCart, fetchCart } from "@/lib/features/cart/cartSlice";
import { useAuth } from "@/app/AuthProvider";

export default function PublicLayout({ children }) {
    const dispatch = useDispatch()
    const { token, isCustomer } = useAuth()

    useEffect(() => {
        dispatch(fetchProducts({ per_page: 50 }))
    }, [dispatch])

    useEffect(() => {
        if (token && isCustomer) {
            dispatch(fetchCart({ token }))
            return
        }

        dispatch(clearCart())
    }, [dispatch, isCustomer, token])

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>{children}</main>
            <Footer />
        </div>
    );
}
