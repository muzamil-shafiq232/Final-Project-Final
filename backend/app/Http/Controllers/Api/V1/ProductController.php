<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Product\StoreProductRequest;
use App\Http\Requests\Api\V1\Product\UpdateProductRequest;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->with(['category', 'images'])
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        if (!$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }

        if ($request->filled('category_slug')) {
            $categorySlug = (string) $request->input('category_slug');
            $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $categorySlug));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($searchQuery) use ($search): void {
                $searchQuery
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('short_description', 'like', '%'.$search.'%');
            });
        }

        $perPage = min((int) $request->integer('per_page', 12), 50);
        $products = $query->paginate($perPage);

        return $this->successResponse(
            message: 'Products fetched successfully.',
            data: ProductResource::collection($products->items()),
            meta: [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        );
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        $isAdminRoute = $request->routeIs('api.v1.admin.*');
        if (!$isAdminRoute && !$product->is_active) {
            return $this->errorResponse(
                message: 'Product not found.',
                errors: ['product' => ['The requested product is unavailable.']],
                status: 404
            );
        }

        return $this->successResponse(
            message: 'Product fetched successfully.',
            data: new ProductResource($product->load(['category', 'images']))
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $name = (string) $payload['name'];
        $slug = $payload['slug'] ?? Str::slug($name);
        $sku = $payload['sku'] ?? strtoupper(Str::random(10));

        $product = Product::query()->create([
            'category_id' => $payload['category_id'],
            'name' => $name,
            'slug' => $slug,
            'sku' => $sku,
            'short_description' => $payload['short_description'] ?? null,
            'description' => $payload['description'] ?? null,
            'price' => $payload['price'],
            'compare_at_price' => $payload['compare_at_price'] ?? null,
            'stock' => $payload['stock'],
            'low_stock_threshold' => $payload['low_stock_threshold'] ?? 5,
            'is_active' => $payload['is_active'] ?? true,
            'published_at' => $payload['published_at'] ?? now(),
        ]);

        $this->syncProductImages(
            product: $product,
            uploadedImages: collect($request->file('images', [])),
            imageUrls: collect($payload['image_urls'] ?? []),
            replace: true
        );

        return $this->successResponse(
            message: 'Product created successfully.',
            data: new ProductResource($product->load(['category', 'images'])),
            status: 201
        );
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $payload = $request->validated();

        if (array_key_exists('name', $payload) && !array_key_exists('slug', $payload)) {
            $payload['slug'] = Str::slug((string) $payload['name']);
        }

        $product->update($payload);

        $uploadedImages = collect($request->file('images', []));
        $imageUrls = collect($payload['image_urls'] ?? []);
        if ($uploadedImages->isNotEmpty() || $imageUrls->isNotEmpty()) {
            $this->syncProductImages(
                product: $product,
                uploadedImages: $uploadedImages,
                imageUrls: $imageUrls,
                replace: true
            );
        }

        return $this->successResponse(
            message: 'Product updated successfully.',
            data: new ProductResource($product->refresh()->load(['category', 'images']))
        );
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->deleteProductImageFiles($product->images()->get());
        $product->images()->delete();
        $product->delete();

        return $this->successResponse(
            message: 'Product deleted successfully.'
        );
    }

    protected function syncProductImages(
        Product $product,
        Collection $uploadedImages,
        Collection $imageUrls,
        bool $replace
    ): void {
        if ($replace) {
            $existingImages = $product->images()->get();
            $this->deleteProductImageFiles($existingImages);
            $product->images()->delete();
        }

        $sortOrder = 0;

        foreach ($uploadedImages as $imageFile) {
            if (!$imageFile instanceof UploadedFile) {
                continue;
            }

            $storedPath = $imageFile->store('products', 'public');
            ProductImage::query()->create([
                'product_id' => $product->id,
                'image_url' => Storage::url($storedPath),
                'alt_text' => $product->name,
                'is_primary' => $sortOrder === 0,
                'sort_order' => $sortOrder,
            ]);
            $sortOrder++;
        }

        foreach ($imageUrls as $imageUrl) {
            ProductImage::query()->create([
                'product_id' => $product->id,
                'image_url' => (string) $imageUrl,
                'alt_text' => $product->name,
                'is_primary' => $sortOrder === 0,
                'sort_order' => $sortOrder,
            ]);
            $sortOrder++;
        }
    }

    protected function deleteProductImageFiles(Collection $images): void
    {
        foreach ($images as $image) {
            $url = (string) $image->image_url;
            if (!Str::startsWith($url, '/storage/')) {
                continue;
            }

            $relativePath = Str::after($url, '/storage/');
            Storage::disk('public')->delete($relativePath);
        }
    }
}
