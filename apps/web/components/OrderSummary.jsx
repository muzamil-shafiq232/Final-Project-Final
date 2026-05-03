import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthProvider';
import { clearCart, fetchCart } from '@/lib/features/cart/cartSlice';
import { placeOrderApi } from '@/lib/shopApi';

const OrderSummary = ({ totalPrice }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const router = useRouter();
    const dispatch = useDispatch();
    const { token } = useAuth();
    const addressList = useSelector((state) => state.address.list);

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [placingOrder, setPlacingOrder] = useState(false);

    const getDetailedError = (error) => {
        const details = error?.details;
        if (!details || typeof details !== 'object') {
            return null;
        }

        const firstErrorGroup = Object.values(details).find(
            (value) => Array.isArray(value) && value.length > 0,
        );

        return firstErrorGroup?.[0] || null;
    };

    useEffect(() => {
        if (!selectedAddress && addressList.length > 0) {
            setSelectedAddress(addressList[0]);
        }
    }, [addressList, selectedAddress]);

    const handleCouponCode = async (event) => {
        event.preventDefault();
    };

    const handlePlaceOrder = async () => {
        if (!token) {
            toast.error('Please login to place your order.');
            return;
        }
        if (!selectedAddress) {
            toast.error('Please select a shipping address.');
            return;
        }

        try {
            setPlacingOrder(true);
            await placeOrderApi(token, {
                payment_method: 'COD',
                shipping_address: selectedAddress,
            });
            dispatch(clearCart());
            toast.success('Order placed successfully.');
            router.push('/orders');
        } catch (error) {
            const message = getDetailedError(error) || error?.message || 'Unable to place order.';
            toast.error(message);
            await dispatch(fetchCart({ token }));
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <div className='w-full max-w-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 lg:max-w-[360px]'>
            <h2 className='text-xl font-bold uppercase tracking-wide text-slate-900'>Order Summary</h2>

            <p className='mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500'>Payment Method</p>
            <div className='mt-2 flex items-center gap-2'>
                <input type="radio" id="COD" checked readOnly className='accent-blue-600' />
                <label htmlFor="COD" className='cursor-default text-slate-700'>Cash on Delivery (COD)</label>
            </div>

            <div className='my-5 border-y border-slate-200 py-5'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Shipping Address</p>
                {selectedAddress ? (
                    <div className='mt-2 flex items-center gap-2'>
                        <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                        <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer text-blue-600' size={16} />
                    </div>
                ) : (
                    <div className='mt-3'>
                        {addressList.length > 0 && (
                            <select
                                className='w-full border border-slate-300 bg-white p-2 outline-none'
                                value={selectedAddress ? String(addressList.findIndex((address) => address === selectedAddress)) : ''}
                                onChange={(e) => {
                                    if (e.target.value === '') {
                                        setSelectedAddress(null);
                                        return;
                                    }
                                    const selectedIndex = Number(e.target.value);
                                    setSelectedAddress(addressList[selectedIndex] || null);
                                }}
                            >
                                <option value="">Select Address</option>
                                {addressList.map((address, index) => (
                                    <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                ))}
                            </select>
                        )}
                        <button className='mt-2 flex items-center gap-1 text-blue-600' onClick={() => setShowAddressModal(true)}>
                            Add Address <PlusIcon size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className='space-y-2 border-b border-slate-200 pb-4'>
                <div className='flex items-center justify-between'>
                    <p>Subtotal</p>
                    <p className='font-semibold text-slate-900'>{currency}{totalPrice.toLocaleString()}</p>
                </div>
                <div className='flex items-center justify-between'>
                    <p>Shipping</p>
                    <p className='font-semibold text-slate-900'>Free</p>
                </div>
                {coupon && (
                    <div className='flex items-center justify-between'>
                        <p>Coupon</p>
                        <p className='font-semibold text-slate-900'>-{currency}{(coupon.discount / 100 * totalPrice).toFixed(2)}</p>
                    </div>
                )}

                {!coupon ? (
                    <form onSubmit={(e) => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='mt-3 flex gap-2'>
                        <input
                            onChange={(e) => setCouponCodeInput(e.target.value)}
                            value={couponCodeInput}
                            type="text"
                            placeholder='Coupon code'
                            className='w-full border border-slate-300 bg-white p-2 outline-none'
                        />
                        <button className='bg-blue-600 px-3 text-white hover:bg-blue-700'>Apply</button>
                    </form>
                ) : (
                    <div className='mt-2 flex items-center gap-2 text-xs'>
                        <p>Code: <span className='font-semibold'>{coupon.code.toUpperCase()}</span></p>
                        <XIcon size={14} onClick={() => setCoupon('')} className='cursor-pointer text-red-600' />
                    </div>
                )}
            </div>

            <div className='flex items-center justify-between py-4 text-base font-bold text-slate-900'>
                <p>Total</p>
                <p>{currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}</p>
            </div>

            <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className='w-full bg-blue-600 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-blue-700 disabled:opacity-60'
            >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}
        </div>
    )
}

export default OrderSummary
