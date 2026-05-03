<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Category\StoreCategoryRequest;
use App\Http\Requests\Api\V1\Category\UpdateCategoryRequest;
use App\Http\Resources\Api\V1\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::query()->orderBy('sort_order')->orderBy('name');

        if (!$request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        $categories = $query->get();

        return $this->successResponse(
            message: 'Categories fetched successfully.',
            data: CategoryResource::collection($categories)
        );
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $category = Category::query()->create([
            'name' => $payload['name'],
            'slug' => $payload['slug'] ?? Str::slug($payload['name']),
            'description' => $payload['description'] ?? null,
            'is_active' => $payload['is_active'] ?? true,
            'sort_order' => $payload['sort_order'] ?? 0,
        ]);

        return $this->successResponse(
            message: 'Category created successfully.',
            data: new CategoryResource($category),
            status: 201
        );
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $payload = $request->validated();

        if (array_key_exists('name', $payload) && !array_key_exists('slug', $payload)) {
            $payload['slug'] = Str::slug($payload['name']);
        }

        $category->update($payload);

        return $this->successResponse(
            message: 'Category updated successfully.',
            data: new CategoryResource($category->refresh())
        );
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return $this->errorResponse(
                message: 'Category cannot be deleted while products are assigned to it.',
                errors: ['category' => ['Move products to another category before deleting this one.']],
                status: 422
            );
        }

        $category->delete();

        return $this->successResponse(
            message: 'Category deleted successfully.'
        );
    }
}
