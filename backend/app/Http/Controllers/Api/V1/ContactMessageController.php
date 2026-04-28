<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Contact\StoreContactMessageRequest;
use App\Http\Resources\Api\V1\ContactMessageResource;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $messages = ContactMessage::query()
            ->where('user_id', $user->id)
            ->with('repliedBy')
            ->latest('id')
            ->get();

        return $this->successResponse(
            message: 'Contact messages fetched successfully.',
            data: ContactMessageResource::collection($messages)
        );
    }

    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        $user = $request->user();
        $payload = $request->validated();

        $contactMessage = ContactMessage::query()->create([
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'subject' => $payload['subject'],
            'message' => $payload['message'],
            'status' => 'pending',
        ]);

        return $this->successResponse(
            message: 'Message sent successfully.',
            data: new ContactMessageResource($contactMessage),
            status: 201
        );
    }
}
