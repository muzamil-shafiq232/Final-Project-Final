<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ContactMessageController;
use App\Http\Controllers\Api\V1\AdminDatatableController;
use App\Http\Controllers\Api\V1\AdminContactMessageController;
use App\Http\Controllers\Api\V1\AdminDashboardController;
use App\Http\Controllers\Api\V1\AdminOrderController;
use App\Http\Controllers\Api\V1\AdminUserController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->as('api.v1.')
    ->group(function (): void {
        Route::prefix('auth')
            ->as('auth.')
            ->group(function (): void {
                Route::post('/register', [AuthController::class, 'register'])->name('register');
                Route::post('/login', [AuthController::class, 'login'])->name('login');

                Route::middleware('auth:sanctum')->group(function (): void {
                    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
                    Route::get('/me', [AuthController::class, 'me'])->name('me');
                });
            });

        Route::prefix('admin')
            ->as('admin.')
            ->middleware(['auth:sanctum', 'role:admin'])
            ->group(function (): void {
                Route::get('/profile', [ProfileController::class, 'adminProfile'])->name('profile');
                Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats'])->name('dashboard.stats');
                Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
                Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
                Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
                Route::patch('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
                Route::get('/contact-messages', [AdminContactMessageController::class, 'index'])->name('contact-messages.index');
                Route::patch('/contact-messages/{contactMessage}/reply', [AdminContactMessageController::class, 'reply'])->name('contact-messages.reply');
                Route::prefix('datatables')->as('datatables.')->group(function (): void {
                    Route::get('/products', [AdminDatatableController::class, 'products'])->name('products');
                    Route::get('/categories', [AdminDatatableController::class, 'categories'])->name('categories');
                    Route::get('/orders', [AdminDatatableController::class, 'orders'])->name('orders');
                    Route::get('/users', [AdminDatatableController::class, 'users'])->name('users');
                });
                Route::apiResource('categories', CategoryController::class)->except(['show']);
                Route::apiResource('products', ProductController::class);
            });

        Route::prefix('customer')
            ->as('customer.')
            ->middleware(['auth:sanctum', 'role:customer'])
            ->group(function (): void {
                Route::get('/profile', [ProfileController::class, 'customerProfile'])->name('profile');
                Route::get('/cart', [CartController::class, 'show'])->name('cart.show');
                Route::post('/cart/items', [CartController::class, 'addItem'])->name('cart.items.add');
                Route::put('/cart/items/{product}', [CartController::class, 'updateItem'])->name('cart.items.update');
                Route::delete('/cart/items/{product}', [CartController::class, 'removeItem'])->name('cart.items.remove');
                Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
                Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
            });

        Route::middleware('auth:sanctum')
            ->group(function (): void {
                Route::get('/contact-messages', [ContactMessageController::class, 'index'])->name('contact-messages.index');
                Route::post('/contact-messages', [ContactMessageController::class, 'store'])->name('contact-messages.store');
            });

        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
    });
