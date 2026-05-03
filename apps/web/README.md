# Singitronic Frontend

Next.js storefront + admin frontend using the Electronics template UI, integrated with the Laravel backend API.

## Setup

1. Install dependencies:
   ```bash
   cd apps/web
   npm install
   ```

2. Create `.env.local` from `.env.example` and set:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open:
   - Storefront: `http://localhost:3000`
   - Admin: `http://localhost:3000/admin`
   - Admin Contact Messages: `http://localhost:3000/admin/contact-messages`

## Backend Integration

- Auth endpoints: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`
- Storefront APIs: `/products`, `/categories`, cart and orders
- Admin APIs: dashboard stats, users, orders, categories, products, contact messages

## Notes

- This frontend expects the Laravel backend to be running at `127.0.0.1:8000`.
- After changing env values, restart the frontend dev server.
