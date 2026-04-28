<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = $this->relationLoaded('images')
            ? $this->images
                ->pluck('image_url')
                ->map(fn (mixed $imageUrl): string => $this->resolveImageUrl((string) $imageUrl, $request))
                ->values()
                ->all()
            : [];

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => (float) $this->price,
            'compare_at_price' => $this->compare_at_price !== null ? (float) $this->compare_at_price : null,
            'stock' => $this->stock,
            'in_stock' => $this->stock > 0,
            'is_active' => $this->is_active,
            'published_at' => $this->published_at,
            'images' => $images,
            'category' => $this->when(
                $this->relationLoaded('category') && $this->category,
                fn (): array => [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                ]
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    protected function resolveImageUrl(string $imageUrl, Request $request): string
    {
        if ($imageUrl === '') {
            return $imageUrl;
        }

        if (Str::startsWith($imageUrl, ['http://', 'https://'])) {
            $path = parse_url($imageUrl, PHP_URL_PATH);
            if (is_string($path) && Str::startsWith($path, '/storage/')) {
                return rtrim($request->getSchemeAndHttpHost(), '/').$path;
            }

            return $imageUrl;
        }

        if (!Str::startsWith($imageUrl, '/')) {
            $imageUrl = '/'.ltrim($imageUrl, '/');
        }

        return rtrim($request->getSchemeAndHttpHost(), '/').$imageUrl;
    }
}
