<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        protected UserRepository $userRepository
    ) {}

    public function register(array $payload): array
    {
        $user = $this->userRepository->create([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => $payload['password'],
        ]);

        return $this->buildAuthPayload($user);
    }

    public function login(array $payload): array
    {
        $user = $this->userRepository->findByEmail($payload['email']);

        if (!$user || !Hash::check($payload['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $this->buildAuthPayload($user);
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    protected function buildAuthPayload(User $user): array
    {
        return [
            'token' => $user->createToken('api-token')->plainTextToken,
            'token_type' => 'Bearer',
            'user' => $user,
        ];
    }
}

