<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables;

class AdminDatatableController extends ApiController
{
    public function products(Request $request): JsonResponse
    {
        $query = Product::query()
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->select([
                'products.id',
                'products.name',
                'products.price',
                'products.compare_at_price',
                'products.stock',
                'products.is_active',
                'products.created_at',
                'categories.name as category_name',
            ])
            ->selectSub(
                ProductImage::query()
                    ->select('image_url')
                    ->whereColumn('product_images.product_id', 'products.id')
                    ->orderByDesc('is_primary')
                    ->orderBy('sort_order')
                    ->limit(1),
                'primary_image'
            );

        if (!$request->boolean('include_inactive')) {
            $query->where('products.is_active', true);
        }

        return DataTables::eloquent($query)->toJson();
    }

    public function categories(): JsonResponse
    {
        $query = Category::query()
            ->select(['id', 'name', 'slug', 'description', 'is_active', 'sort_order', 'created_at']);

        return DataTables::eloquent($query)->toJson();
    }

    public function orders(Request $request): JsonResponse
    {
        $query = Order::query()
            ->leftJoin('users', 'users.id', '=', 'orders.user_id')
            ->select([
                'orders.id',
                'orders.order_number',
                'orders.total_amount',
                'orders.status',
                'orders.payment_status',
                'orders.payment_method',
                'orders.customer_name',
                'orders.customer_email',
                'orders.created_at',
                'users.name as user_name',
                'users.email as user_email',
            ]);

        if ($request->filled('status')) {
            $query->where('orders.status', (string) $request->input('status'));
        }

        return DataTables::eloquent($query)->toJson();
    }

    public function users(): JsonResponse
    {
        $query = User::query()
            ->where('role', 'customer')
            ->withCount('orders')
            ->withSum(
                ['orders as total_spent' => fn ($orderQuery) => $orderQuery->whereIn('status', ['paid', 'shipped', 'delivered'])],
                'total_amount'
            )
            ->select(['id', 'name', 'email', 'phone', 'role', 'is_active', 'created_at']);

        return DataTables::eloquent($query)->toJson();
    }
}
