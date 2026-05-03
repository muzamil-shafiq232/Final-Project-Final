<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends ApiController
{
    public function adminProfile(Request $request): JsonResponse
    {
        return $this->successResponse(
            message: 'Admin profile fetched successfully.',
            data: $request->user()
        );
    }

    public function customerProfile(Request $request): JsonResponse
    {
        return $this->successResponse(
            message: 'Customer profile fetched successfully.',
            data: $request->user()
        );
    }
}

