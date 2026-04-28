<?php

namespace App\Http\Requests\Api\V1\Order;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'payment_method' => ['required', 'string', Rule::in(['COD', 'STRIPE'])],
            'notes' => ['nullable', 'string', 'max:1000'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.name' => ['required', 'string', 'max:120'],
            'shipping_address.email' => ['required', 'email', 'max:180'],
            'shipping_address.phone' => ['required', 'string', 'max:40'],
            'shipping_address.street' => ['required', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:120'],
            'shipping_address.state' => ['required', 'string', 'max:120'],
            'shipping_address.zip' => ['required', 'string', 'max:40'],
            'shipping_address.country' => ['required', 'string', 'max:120'],
        ];
    }
}

