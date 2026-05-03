<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends ApiController
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $authPayload = $this->authService->register($request->validated());

        return $this->successResponse(
            message: 'Registration successful.',
            data: $authPayload,
            status: 201
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $authPayload = $this->authService->login($request->validated());
        } catch (ValidationException $exception) {
            return $this->errorResponse(
                message: 'Authentication failed.',
                errors: $exception->errors(),
                status: 401
            );
        }

        return $this->successResponse(
            message: 'Login successful.',
            data: $authPayload
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return $this->successResponse(
            message: 'Logout successful.'
        );
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse(
            message: 'Authenticated user profile.',
            data: $request->user()
        );
    }
}
