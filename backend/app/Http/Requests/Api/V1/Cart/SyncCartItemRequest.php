<?php

namespace App\Http\Requests\Api\V1\Cart;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Validation\Rule;

class SyncCartItemRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $quantityMinimum = $this->isMethod('put') || $this->isMethod('patch') ? 0 : 1;

        return [
            'product_id' => ['sometimes', 'required', 'integer', Rule::exists('products', 'id')->whereNull('deleted_at')],
            'quantity' => ['sometimes', 'required', 'integer', 'min:'.$quantityMinimum],
        ];
    }
}
