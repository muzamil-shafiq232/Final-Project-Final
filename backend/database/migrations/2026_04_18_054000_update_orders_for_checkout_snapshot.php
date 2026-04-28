<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('orders', 'payment_method')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('payment_method', 40)->default('COD')->after('payment_status');
            });
        }
        if (!Schema::hasColumn('orders', 'customer_name')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('customer_name', 120)->nullable()->after('notes');
            });
        }
        if (!Schema::hasColumn('orders', 'customer_email')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('customer_email', 180)->nullable()->after('customer_name');
            });
        }
        if (!Schema::hasColumn('orders', 'customer_phone')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('customer_phone', 40)->nullable()->after('customer_email');
            });
        }
        if (!Schema::hasColumn('orders', 'shipping_address_line')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('shipping_address_line', 255)->nullable()->after('customer_phone');
            });
        }
        if (!Schema::hasColumn('orders', 'shipping_city')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('shipping_city', 120)->nullable()->after('shipping_address_line');
            });
        }
        if (!Schema::hasColumn('orders', 'shipping_state')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('shipping_state', 120)->nullable()->after('shipping_city');
            });
        }
        if (!Schema::hasColumn('orders', 'shipping_postal_code')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('shipping_postal_code', 40)->nullable()->after('shipping_state');
            });
        }
        if (!Schema::hasColumn('orders', 'shipping_country')) {
            Schema::table('orders', function (Blueprint $table): void {
                $table->string('shipping_country', 120)->nullable()->after('shipping_postal_code');
            });
        }

        DB::table('orders')
            ->where('status', 'processing')
            ->update(['status' => 'pending']);

        DB::statement("ALTER TABLE orders MODIFY status ENUM('pending','paid','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY status ENUM('pending','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending'");

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn([
                'payment_method',
                'customer_name',
                'customer_email',
                'customer_phone',
                'shipping_address_line',
                'shipping_city',
                'shipping_state',
                'shipping_postal_code',
                'shipping_country',
            ]);
        });
    }
};

