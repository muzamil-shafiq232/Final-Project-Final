<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', 'customer')
            ->withCount('orders')
            ->withSum(['orders as total_spent' => fn ($orderQuery) => $orderQuery->whereIn('status', ['paid', 'shipped', 'delivered'])], 'total_amount')
            ->orderByDesc('id');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($searchQuery) use ($search): void {
                $searchQuery
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%');
            });
        }

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $users = $query->paginate($perPage);

        $data = collect($users->items())
            ->map(fn (User $user): array => $this->transformUser($user))
            ->all();

        return $this->successResponse(
            message: 'Users fetched successfully.',
            data: $data,
            meta: [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        );
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $payload = $request->validated();
        $currentUser = $request->user();

        if (
            $currentUser
            && $currentUser->id === $user->id
            && array_key_exists('is_active', $payload)
            && $payload['is_active'] === false
        ) {
            return $this->errorResponse(
                message: 'You cannot deactivate your own account.',
                errors: ['is_active' => ['Please keep your current admin account active.']]
            );
        }

        $user->update($payload);

        $user->loadCount('orders')
            ->loadSum(
                ['orders as total_spent' => fn ($orderQuery) => $orderQuery->whereIn('status', ['paid', 'shipped', 'delivered'])],
                'total_amount'
            );

        return $this->successResponse(
            message: 'User updated successfully.',
            data: $this->transformUser($user)
        );
    }

    protected function transformUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'is_active' => (bool) $user->is_active,
            'orders_count' => (int) ($user->orders_count ?? 0),
            'total_spent' => (float) ($user->total_spent ?? 0),
            'created_at' => $user->created_at,
        ];
    }
}

