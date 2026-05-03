<?php

namespace App\Http\Requests\Api\V1\Contact;

use App\Http\Requests\Api\ApiFormRequest;

class StoreContactMessageRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'subject' => ['required', 'string', 'max:180'],
            'message' => ['required', 'string', 'max:5000'],
        ];
    }
}
