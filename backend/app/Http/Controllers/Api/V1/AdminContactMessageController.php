<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Admin\ReplyContactMessageRequest;
use App\Http\Resources\Api\V1\ContactMessageResource;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class AdminContactMessageController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query()
            ->with(['user', 'repliedBy'])
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($searchQuery) use ($search): void {
                $searchQuery
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('subject', 'like', '%'.$search.'%')
                    ->orWhere('message', 'like', '%'.$search.'%');
            });
        }

        $perPage = min((int) $request->integer('per_page', 20), 100);
        $messages = $query->paginate($perPage);

        return $this->successResponse(
            message: 'Contact messages fetched successfully.',
            data: ContactMessageResource::collection($messages->items()),
            meta: [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ]
        );
    }

    public function reply(ReplyContactMessageRequest $request, ContactMessage $contactMessage): JsonResponse
    {
        $reply = $request->validated()['reply'];
        $admin = $request->user();

        $contactMessage->update([
            'admin_reply' => $reply,
            'status' => 'replied',
            'replied_by' => $admin->id,
            'replied_at' => now(),
        ]);

        Mail::raw($reply, function (Message $message) use ($contactMessage): void {
            $message
                ->to($contactMessage->email, $contactMessage->name)
                ->subject('Re: '.$contactMessage->subject);
        });

        return $this->successResponse(
            message: 'Reply sent successfully.',
            data: new ContactMessageResource($contactMessage->refresh()->load(['user', 'repliedBy']))
        );
    }
}
