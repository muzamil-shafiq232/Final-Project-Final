<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();
        $categoryIds = DB::table('categories')->pluck('id', 'slug');

        $products = [
            [
                'category_slug' => 'electronics',
                'name' => 'Aero Wireless Headphones',
                'slug' => 'aero-wireless-headphones',
                'sku' => 'ELEC-AERO-001',
                'short_description' => 'Noise-cancelling headphones with deep bass.',
                'description' => 'Over-ear wireless headphones with premium sound and 30-hour battery life.',
                'price' => 129.99,
                'compare_at_price' => 149.99,
                'stock' => 42,
                'low_stock_threshold' => 8,
                'is_active' => true,
                'published_at' => $now,
                'images' => [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
                    'https://images.unsplash.com/photo-1546435770-a3e426bf472b',
                ],
            ],
            [
                'category_slug' => 'electronics',
                'name' => 'Pulse Smartwatch',
                'slug' => 'pulse-smartwatch',
                'sku' => 'ELEC-PULSE-002',
                'short_description' => 'Smartwatch with health tracking features.',
                'description' => 'Water-resistant smartwatch with heart-rate tracking and smart notifications.',
                'price' => 179.00,
                'compare_at_price' => 199.00,
                'stock' => 28,
                'low_stock_threshold' => 6,
                'is_active' => true,
                'published_at' => $now,
                'images' => [
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
                ],
            ],
            [
                'category_slug' => 'fashion',
                'name' => 'Urban Sneakers',
                'slug' => 'urban-sneakers',
                'sku' => 'FASH-SNEAK-003',
                'short_description' => 'Comfortable breathable sneakers.',
                'description' => 'Lightweight sneakers built for walking comfort and daily use.',
                'price' => 74.50,
                'compare_at_price' => 89.00,
                'stock' => 60,
                'low_stock_threshold' => 12,
                'is_active' => true,
                'published_at' => $now,
                'images' => [
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
                ],
            ],
            [
                'category_slug' => 'home-living',
                'name' => 'Nordic Table Lamp',
                'slug' => 'nordic-table-lamp',
                'sku' => 'HOME-LAMP-004',
                'short_description' => 'Warm adjustable LED table lamp.',
                'description' => 'Minimal Nordic-style lamp for bedroom or work desk lighting.',
                'price' => 58.90,
                'compare_at_price' => 69.90,
                'stock' => 24,
                'low_stock_threshold' => 5,
                'is_active' => true,
                'published_at' => $now,
                'images' => [
                    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
                ],
            ],
            [
                'category_slug' => 'beauty',
                'name' => 'HydraGlow Serum',
                'slug' => 'hydraglow-serum',
                'sku' => 'BEAU-SERUM-005',
                'short_description' => 'Hydrating daily facial serum.',
                'description' => 'Vitamin-rich facial serum for hydration and skin glow.',
                'price' => 39.99,
                'compare_at_price' => 49.99,
                'stock' => 75,
                'low_stock_threshold' => 10,
                'is_active' => true,
                'published_at' => $now,
                'images' => [
                    'https://images.unsplash.com/photo-1556228578-dd6a486d8f15',
                ],
            ],
            [
                'category_slug' => 'sports',
                'name' => 'Pro Yoga Mat',
                'slug' => 'pro-yoga-mat',
                'sku' => 'SPORT-MAT-006',
                'short_description' => 'Anti-slip yoga mat for home workouts.',
                'description' => 'High-density yoga mat with superior grip and cushioning.',
                'price' => 44.00,
                'compare_at_price' => 54.00,
                'stock' => 36,
                'low_stock_threshold' => 7,
                'is_active' => true,
                'published_at' => $now,
                'images' => [
                    'https://images.unsplash.com/photo-1518611012118-696072aa579a',
                ],
            ],
        ];

        foreach ($products as $product) {
            $categoryId = $categoryIds[$product['category_slug']] ?? null;
            if (!$categoryId) {
                continue;
            }

            $productData = [
                'category_id' => $categoryId,
                'name' => $product['name'],
                'slug' => $product['slug'],
                'sku' => $product['sku'],
                'short_description' => $product['short_description'],
                'description' => $product['description'],
                'price' => $product['price'],
                'compare_at_price' => $product['compare_at_price'],
                'stock' => $product['stock'],
                'low_stock_threshold' => $product['low_stock_threshold'],
                'is_active' => $product['is_active'],
                'published_at' => $product['published_at'],
                'updated_at' => $now,
            ];

            $existingId = DB::table('products')->where('slug', $product['slug'])->value('id');
            if ($existingId) {
                DB::table('products')->where('id', $existingId)->update($productData);
                $productId = $existingId;
            } else {
                $productId = DB::table('products')->insertGetId([
                    ...$productData,
                    'created_at' => $now,
                ]);
            }

            DB::table('product_images')->where('product_id', $productId)->delete();

            $images = collect($product['images'])->values()->map(
                fn (string $imageUrl, int $index): array => [
                    'product_id' => $productId,
                    'image_url' => $imageUrl,
                    'alt_text' => $product['name'],
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            )->all();

            DB::table('product_images')->insert($images);
        }
    }
}
