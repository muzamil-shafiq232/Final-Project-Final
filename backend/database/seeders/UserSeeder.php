<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Platform Admin',
                'email' => 'admin@ecommerce.local',
                'password' => Hash::make('Admin@123'),
                'role' => 'admin',
                'phone' => '+1 555 000 0001',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Alice Customer',
                'email' => 'alice@ecommerce.local',
                'password' => Hash::make('Customer@123'),
                'role' => 'customer',
                'phone' => '+1 555 000 1001',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Bob Customer',
                'email' => 'bob@ecommerce.local',
                'password' => Hash::make('Customer@123'),
                'role' => 'customer',
                'phone' => '+1 555 000 1002',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Charlie Customer',
                'email' => 'charlie@ecommerce.local',
                'password' => Hash::make('Customer@123'),
                'role' => 'customer',
                'phone' => '+1 555 000 1003',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            User::query()->updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }
    }
}
