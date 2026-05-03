<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends ApiController
{
    public function stats(): JsonResponse
    {
        $totalSales = (float) Order::query()
            ->whereIn('status', ['paid', 'shipped', 'delivered'])
            ->sum('total_amount');

        $totalOrders = Order::query()->count();
        $totalUsers = User::query()->where('role', 'customer')->count();

        $statusBreakdown = Order::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $latestOrders = Order::query()
            ->with(['user', 'items.product.images'])
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        return $this->successResponse(
            message: 'Dashboard stats fetched successfully.',
            data: [
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'total_users' => $totalUsers,
                'status_breakdown' => $statusBreakdown,
                'latest_orders' => OrderResource::collection($latestOrders),
            ]
        );
    }
}

