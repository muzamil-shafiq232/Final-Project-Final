<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with(['user', 'items.product.images'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($searchQuery) use ($search): void {
                $searchQuery
                    ->where('order_number', 'like', '%'.$search.'%')
                    ->orWhere('customer_name', 'like', '%'.$search.'%')
                    ->orWhere('customer_email', 'like', '%'.$search.'%');
            });
        }

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $orders = $query->paginate($perPage);

        return $this->successResponse(
            message: 'Orders fetched successfully.',
            data: OrderResource::collection($orders->items()),
            meta: [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
        );
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $nextStatus = $request->validated()['status'];
        $updates = ['status' => $nextStatus];

        if ($nextStatus === 'paid') {
            $updates['payment_status'] = 'paid';
        } elseif ($nextStatus === 'delivered' && $order->payment_method === 'COD') {
            $updates['payment_status'] = 'paid';
        } elseif ($nextStatus === 'refunded') {
            $updates['payment_status'] = 'refunded';
        } elseif ($nextStatus === 'cancelled' && $order->payment_status === 'pending') {
            $updates['payment_status'] = 'failed';
        }

        $order->update($updates);

        return $this->successResponse(
            message: 'Order status updated successfully.',
            data: new OrderResource($order->refresh()->load(['user', 'items.product.images']))
        );
    }
}

