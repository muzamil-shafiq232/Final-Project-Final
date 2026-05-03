'use client'

import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProductByIdApi } from "@/lib/shopApi";

export default function Product() {
    const { productId } = useParams();
    const [product, setProduct] = useState();

    useEffect(() => {
        const fetchProduct = async () => {
            const fetchedProduct = await fetchProductByIdApi(productId);
            setProduct(fetchedProduct);
            scrollTo(0, 0);
        };

        fetchProduct();
    }, [productId]);

    return (
        <section className="bg-white">
            <div className="container-electronics py-8">
                <div className="mb-6 text-sm text-slate-500">
                    <Link href="/" className="hover:text-blue-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/shop" className="hover:text-blue-600">Shop</Link>
                    <span className="mx-2">/</span>
                    {product?.category || 'Product'}
                </div>

                {product && (<ProductDetails product={product} />)}
                {product && (<ProductDescription product={product} />)}
            </div>
        </section>
    );
}
