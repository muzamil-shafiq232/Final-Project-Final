<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
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
            ->get(['id'])
            ->values();

        $products = DB::table('products')
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->limit(4)
            ->get(['id', 'name', 'sku', 'price', 'stock'])
            ->keyBy('id');

        if ($customers->isEmpty() || $products->isEmpty()) {
            return;
        }

        DB::table('order_items')->delete();
        DB::table('orders')->delete();

        $orderTemplates = [
            [
                'status' => 'paid',
                'payment_status' => 'paid',
                'shipping_amount' => 10.00,
                'discount_amount' => 0.00,
                'tax_rate' => 0.10,
                'notes' => 'Priority delivery requested.',
                'lines' => [
                    ['product_index' => 0, 'quantity' => 1],
                    ['product_index' => 1, 'quantity' => 2],
                ],
            ],
            [
                'status' => 'delivered',
                'payment_status' => 'paid',
                'shipping_amount' => 8.00,
                'discount_amount' => 5.00,
                'tax_rate' => 0.10,
                'notes' => 'Delivered successfully.',
                'lines' => [
                    ['product_index' => 2, 'quantity' => 1],
                    ['product_index' => 3, 'quantity' => 1],
                ],
            ],
        ];

        $orderCounter = 1;
        $productsList = $products->values();

        foreach ($customers as $customer) {
            foreach ($orderTemplates as $template) {
                $lineItems = [];
                $subtotal = 0;

                foreach ($template['lines'] as $line) {
                    $product = $productsList[$line['product_index']] ?? null;
                    if (!$product) {
                        continue;
                    }

                    $quantity = (int) $line['quantity'];
                    $lineTotal = $product->price * $quantity;
                    $subtotal += $lineTotal;

                    $lineItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_sku' => $product->sku,
                        'quantity' => $quantity,
                        'unit_price' => $product->price,
                        'total_price' => $lineTotal,
                    ];
                }

                if (empty($lineItems)) {
                    continue;
                }

                $taxAmount = round($subtotal * $template['tax_rate'], 2);
                $totalAmount = round(
                    $subtotal + $taxAmount + $template['shipping_amount'] - $template['discount_amount'],
                    2
                );

                $orderId = DB::table('orders')->insertGetId([
                    'user_id' => $customer->id,
                    'order_number' => sprintf('ORD-%s-%04d', now()->format('Ymd'), $orderCounter++),
                    'status' => $template['status'],
                    'payment_status' => $template['payment_status'],
                    'currency' => 'USD',
                    'subtotal' => round($subtotal, 2),
                    'tax_amount' => $taxAmount,
                    'shipping_amount' => $template['shipping_amount'],
                    'discount_amount' => $template['discount_amount'],
                    'total_amount' => $totalAmount,
                    'notes' => $template['notes'],
                    'placed_at' => now()->subDays(rand(1, 15)),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                foreach ($lineItems as $lineItem) {
                    DB::table('order_items')->insert([
                        'order_id' => $orderId,
                        'product_id' => $lineItem['product_id'],
                        'product_name' => $lineItem['product_name'],
                        'product_sku' => $lineItem['product_sku'],
                        'quantity' => $lineItem['quantity'],
                        'unit_price' => $lineItem['unit_price'],
                        'total_price' => $lineItem['total_price'],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    DB::table('products')
                        ->where('id', $lineItem['product_id'])
                        ->update([
                            'stock' => DB::raw('GREATEST(stock - '.(int) $lineItem['quantity'].', 0)'),
                        ]);
                }
            }
        }
    }
}
