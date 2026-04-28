<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Support\Str;

class UpdateOrderStatusRequest extends ApiFormRequest
{
    protected function prepareForValidation(): void
    {
        $rawStatus = (string) $this->input('status', '');

        $normalizedStatus = Str::of($rawStatus)
            ->lower()
            ->replaceMatches('/\s+/', '_')
            ->replaceMatches('/[^a-z0-9_-]/', '')
            ->trim('_-')
            ->value();

        $this->merge([
            'status' => $normalizedStatus,
        ]);
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'string',
                'min:2',
                'max:40',
                'regex:/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/',
            ],
        ];
    }
}

