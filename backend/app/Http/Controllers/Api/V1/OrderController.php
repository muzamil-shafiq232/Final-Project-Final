<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Order\StoreOrderRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with(['items.product.images'])
            ->orderByDesc('id')
            ->get();

        return $this->successResponse(
            message: 'Orders fetched successfully.',
            data: OrderResource::collection($orders)
        );
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $user = $request->user();

        $cart = Cart::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->with(['items.product'])
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return $this->errorResponse(
                message: 'Cart is empty.',
                errors: ['cart' => ['Add at least one product before checkout.']],
                status: 422
            );
        }

        $unavailableItemIds = $cart->items
            ->filter(function ($item): bool {
                $product = $item->product;

                return !$product || !$product->is_active || $product->stock <= 0;
            })
            ->pluck('id')
            ->all();

        if (!empty($unavailableItemIds)) {
            $cart->items()->whereIn('id', $unavailableItemIds)->delete();
            $cart->load(['items.product']);
        }

        if ($cart->items->isEmpty()) {
            return $this->errorResponse(
                message: 'Checkout failed.',
                errors: ['cart' => ['Unavailable items were removed from your cart. Add available products and try again.']],
                status: 422
            );
        }

        foreach ($cart->items as $item) {
            $product = $item->product;
            if (!$product || !$product->is_active) {
                return $this->errorResponse(
                    message: 'Checkout failed.',
                    errors: ['cart' => ['One or more products are unavailable.']],
                    status: 422
                );
            }

            if ($product->stock < $item->quantity) {
                return $this->errorResponse(
                    message: 'Checkout failed.',
                    errors: ['stock' => ["Insufficient stock for {$product->name}."]],
                    status: 422
                );
            }
        }

        $order = DB::transaction(function () use ($cart, $payload, $user): Order {
            $subtotal = 0;

            foreach ($cart->items as $item) {
                $product = $item->product;
                $subtotal += $item->quantity * (float) $product->price;
            }

            $taxAmount = 0.0;
            $shippingAmount = 0.0;
            $discountAmount = 0.0;
            $totalAmount = round($subtotal + $taxAmount + $shippingAmount - $discountAmount, 2);

            $address = $payload['shipping_address'];

            $order = Order::query()->create([
                'user_id' => $user->id,
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'payment_status' => $payload['payment_method'] === 'STRIPE' ? 'pending' : 'pending',
                'payment_method' => $payload['payment_method'],
                'currency' => 'USD',
                'subtotal' => round($subtotal, 2),
                'tax_amount' => $taxAmount,
                'shipping_amount' => $shippingAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'notes' => $payload['notes'] ?? null,
                'customer_name' => $address['name'],
                'customer_email' => $address['email'],
                'customer_phone' => $address['phone'],
                'shipping_address_line' => $address['street'],
                'shipping_city' => $address['city'],
                'shipping_state' => $address['state'],
                'shipping_postal_code' => $address['zip'],
                'shipping_country' => $address['country'],
                'placed_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                $product = $item->product;
                $unitPrice = (float) $product->price;
                $lineTotal = round($unitPrice * $item->quantity, 2);

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $lineTotal,
                ]);

                Product::query()
                    ->whereKey($product->id)
                    ->decrement('stock', $item->quantity);
            }

            $cart->items()->delete();
            $cart->update([
                'status' => 'converted',
            ]);

            return $order;
        });

        return $this->successResponse(
            message: 'Order placed successfully.',
            data: new OrderResource($order->load(['items.product.images'])),
            status: 201
        );
    }

    protected function generateOrderNumber(): string
    {
        return sprintf(
            'ORD-%s-%s',
            now()->format('YmdHis'),
            Str::upper(Str::random(4))
        );
    }
}

