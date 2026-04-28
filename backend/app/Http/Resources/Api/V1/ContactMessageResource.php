<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'subject' => $this->subject,
            'message' => $this->message,
            'status' => $this->status,
            'admin_reply' => $this->admin_reply,
            'replied_at' => $this->replied_at,
            'user' => $this->when(
                $this->relationLoaded('user') && $this->user,
                fn (): array => [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ]
            ),
            'replied_by_user' => $this->when(
                $this->relationLoaded('repliedBy') && $this->repliedBy,
                fn (): array => [
                    'id' => $this->repliedBy->id,
                    'name' => $this->repliedBy->name,
                    'email' => $this->repliedBy->email,
                ]
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
