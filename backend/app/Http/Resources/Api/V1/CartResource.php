<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->relationLoaded('items') ? $this->items : collect();
        $totalItems = $items ? $items->sum('quantity') : 0;
        $totalPrice = $items
            ? $items->sum(fn ($item) => $item->quantity * (float) $item->unit_price)
            : 0;

        return [
            'id' => $this->id,
            'status' => $this->status,
            'expires_at' => $this->expires_at,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'cart_items_map' => $items
                ? $items->mapWithKeys(fn ($item) => [(string) $item->product_id => $item->quantity])->all()
                : [],
            'total_items' => $totalItems,
            'total_price' => (float) $totalPrice,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
