<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('orders') || !Schema::hasColumn('orders', 'status')) {
            return;
        }

        DB::statement("ALTER TABLE orders MODIFY status VARCHAR(40) NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('orders') || !Schema::hasColumn('orders', 'status')) {
            return;
        }

        DB::table('orders')
            ->whereNotIn('status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'])
            ->update(['status' => 'pending']);

        DB::statement("ALTER TABLE orders MODIFY status ENUM('pending','paid','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending'");
    }
};
