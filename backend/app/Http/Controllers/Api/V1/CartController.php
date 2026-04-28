<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Cart\SyncCartItemRequest;
use App\Http\Resources\Api\V1\CartResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends ApiController
{
    public function show(Request $request): JsonResponse
    {
        $cart = $this->resolveActiveCart($request->user()->id);
        $cart->load(['items.product.category', 'items.product.images']);

        return $this->successResponse(
            message: 'Cart fetched successfully.',
            data: new CartResource($cart)
        );
    }

    public function addItem(SyncCartItemRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $product = Product::query()
            ->whereKey($payload['product_id'])
            ->where('is_active', true)
            ->first();

        if (!$product) {
            return $this->errorResponse(
                message: 'Product not found.',
                errors: ['product' => ['The selected product is unavailable.']],
                status: 404
            );
        }

        $cart = $this->resolveActiveCart($request->user()->id);
        $quantityToAdd = max((int) ($payload['quantity'] ?? 1), 1);

        $item = $cart->items()->where('product_id', $product->id)->first();
        if ($item) {
            $item->update([
                'quantity' => $item->quantity + $quantityToAdd,
                'unit_price' => $product->price,
            ]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $quantityToAdd,
                'unit_price' => $product->price,
            ]);
        }

        $cart->load(['items.product.category', 'items.product.images']);

        return $this->successResponse(
            message: 'Item added to cart successfully.',
            data: new CartResource($cart)
        );
    }

    public function updateItem(SyncCartItemRequest $request, Product $product): JsonResponse
    {
        $payload = $request->validated();
        $quantity = max((int) ($payload['quantity'] ?? 0), 0);
        $cart = $this->resolveActiveCart($request->user()->id);

        $item = $cart->items()->where('product_id', $product->id)->first();
        if (!$item) {
            return $this->errorResponse(
                message: 'Cart item not found.',
                errors: ['cart' => ['The requested product is not in the cart.']],
                status: 404
            );
        }

        if ($quantity === 0) {
            $item->delete();
        } else {
            $item->update([
                'quantity' => $quantity,
                'unit_price' => $product->price,
            ]);
        }

        $cart->load(['items.product.category', 'items.product.images']);

        return $this->successResponse(
            message: 'Cart updated successfully.',
            data: new CartResource($cart)
        );
    }

    public function removeItem(Request $request, Product $product): JsonResponse
    {
        $cart = $this->resolveActiveCart($request->user()->id);
        $cart->items()->where('product_id', $product->id)->delete();
        $cart->load(['items.product.category', 'items.product.images']);

        return $this->successResponse(
            message: 'Cart item removed successfully.',
            data: new CartResource($cart)
        );
    }

    protected function resolveActiveCart(int $userId): Cart
    {
        return Cart::query()->firstOrCreate(
            [
                'user_id' => $userId,
                'status' => 'active',
            ],
            [
                'expires_at' => now()->addDays(7),
            ]
        );
    }
}
