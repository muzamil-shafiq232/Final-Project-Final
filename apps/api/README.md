# Ecommerce API Backend (Phase 8)

Laravel API foundation with MySQL + Sanctum token auth.

## Implemented

- Laravel **13.x** backend project (`apps/api/`)
- MySQL environment configured in `.env` / `.env.example`
- Sanctum installed and configured
- API routing structure under `routes/api.php` with `/api/v1/*`
- Login/Register/Logout/Me auth endpoints
- Standardized JSON API response format
- Base architecture folders:
  - `app/Http/Controllers/Api/V1`
  - `app/Services`
  - `app/Repositories`
- E-commerce schema migrations:
  - `users` (with `role`, `is_active`, soft deletes)
  - `categories`
  - `products` (stock + indexes + soft deletes)
  - `product_images`
  - `carts`
  - `cart_items`
  - `orders`
  - `order_items`
- Seeders for realistic dummy data across all core tables

## API Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout` (auth:sanctum)
- `GET /api/v1/auth/me` (auth:sanctum)
- `GET /api/v1/admin/profile` (auth:sanctum + role:admin)
- `GET /api/v1/customer/profile` (auth:sanctum + role:customer)
- `GET /api/v1/categories` (public)
- `GET /api/v1/products` (public, supports `search`, `category_slug`, `category_id`, `per_page`)
- `GET /api/v1/products/{product}` (public)
- `GET|POST|PUT|DELETE /api/v1/admin/categories*` (auth:sanctum + role:admin)
- `GET|POST|PUT|DELETE /api/v1/admin/products*` (auth:sanctum + role:admin)
- `GET /api/v1/admin/dashboard/stats` (auth:sanctum + role:admin)
- `GET /api/v1/admin/orders` (auth:sanctum + role:admin)
- `PATCH /api/v1/admin/orders/{order}/status` (auth:sanctum + role:admin)
- `GET /api/v1/admin/users` (auth:sanctum + role:admin)
- `PATCH /api/v1/admin/users/{user}` (auth:sanctum + role:admin)
- `GET /api/v1/admin/contact-messages` (auth:sanctum + role:admin)
- `PATCH /api/v1/admin/contact-messages/{contactMessage}/reply` (auth:sanctum + role:admin)
- Yajra DataTables endpoints (auth:sanctum + role:admin):
  - `GET /api/v1/admin/datatables/products`
  - `GET /api/v1/admin/datatables/categories`
  - `GET /api/v1/admin/datatables/orders`
  - `GET /api/v1/admin/datatables/users`
- `GET /api/v1/customer/cart` (auth:sanctum + role:customer)
- `POST /api/v1/customer/cart/items` (auth:sanctum + role:customer)
- `PUT /api/v1/customer/cart/items/{product}` (auth:sanctum + role:customer)
- `DELETE /api/v1/customer/cart/items/{product}` (auth:sanctum + role:customer)
- `GET /api/v1/customer/orders` (auth:sanctum + role:customer)
- `POST /api/v1/customer/orders` (auth:sanctum + role:customer, creates order from active cart)
- `GET /api/v1/contact-messages` (auth:sanctum, current user message history)
- `POST /api/v1/contact-messages` (auth:sanctum, registered users only)

## Roles

- `users.role` supports:
  - `admin`
  - `customer`
- Role guard middleware alias: `role`
- Applied on route groups in `routes/api.php` to enforce access separation.

## Standard Response Shape

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {},
  "errors": null,
  "meta": []
}
```

## Setup

1. Ensure MySQL is running and database exists:
   - DB name: `muz_ecommerce`
   - SQL:
     ```sql
     CREATE DATABASE IF NOT EXISTS muz_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
2. Configure `.env` if needed.
3. Install dependencies:

```bash
cd apps/api
composer install
```

4. Run migrations:

```bash
php artisan migrate
```

5. (Optional) Reset and seed demo data:

```bash
php artisan migrate:fresh --seed
```

6. Create the storage symlink (required for product upload images):

```bash
php artisan storage:link
```

7. Start API server:

```bash
php artisan serve
```

Server URL: `http://127.0.0.1:8000`

## Notes

- Yajra DataTables is installed via `yajra/laravel-datatables-oracle` for server-side admin table feeds.
- Contact reply emails use Laravel Mail. If `MAIL_MAILER=log`, replies are written to logs only; configure SMTP in `.env` for real inbox delivery.
