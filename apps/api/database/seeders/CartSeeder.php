<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $customers = DB::table('users')
            ->where('role', 'customer')
            ->whereNull('deleted_at')
            ->limit(2)
            ->pluck('id')
            ->all();

        $products = DB::table('products')
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->limit(3)
            ->get(['id', 'price'])
            ->values();

        if (empty($customers) || $products->isEmpty()) {
            return;
        }

        DB::table('cart_items')->delete();
        DB::table('carts')->delete();

        foreach ($customers as $customerId) {
            $cartId = DB::table('carts')->insertGetId([
                'user_id' => $customerId,
                'status' => 'active',
                'expires_at' => now()->addDays(7),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $items = $products->take(2)->values()->map(
                fn (object $product, int $index): array => [
                    'cart_id' => $cartId,
                    'product_id' => $product->id,
                    'quantity' => $index + 1,
                    'unit_price' => $product->price,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            )->all();

            DB::table('cart_items')->insert($items);
        }
    }
}
