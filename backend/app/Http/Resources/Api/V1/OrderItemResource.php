<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'product_sku' => $this->product_sku,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'total_price' => (float) $this->total_price,
            'product' => $this->when(
                $this->relationLoaded('product') && $this->product,
                fn (): array => [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'images' => $this->product->relationLoaded('images')
                        ? $this->product->images->pluck('image_url')->values()->all()
                        : [],
                ]
            ),
        ];
    }
}

