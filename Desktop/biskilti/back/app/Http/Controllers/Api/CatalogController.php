<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\RentalItem;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json(['categories' => Category::query()->latest()->get()]);
    }

    public function products(): JsonResponse
    {
        return response()->json([
            'products' => Product::query()->with('category')->latest()->get(),
        ]);
    }

    public function rentals(): JsonResponse
    {
        return response()->json(['rentals' => RentalItem::query()->latest()->get()]);
    }
}
