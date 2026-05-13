<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);
        $data = $request->validate([
            'product_title' => ['required_without:product_id', 'string', 'max:255'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:40'],
            'notes' => ['nullable', 'string'],
        ]);

        $product = isset($data['product_id'])
            ? Product::find($data['product_id'])
            : Product::firstOrCreate(
                ['slug' => str($data['product_title'])->slug()->toString()],
                ['title' => $data['product_title'], 'price' => 0]
            );

        $order = Order::create([
            'user_id' => $user?->id,
            'customer_name' => $data['customer_name'] ?? null,
            'customer_email' => $data['customer_email'] ?? null,
            'customer_phone' => $data['customer_phone'] ?? null,
            'total' => $product->price,
            'status' => 'pending',
            'notes' => $data['notes'] ?? null,
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'title' => $product->title,
            'unit_price' => $product->price,
            'quantity' => 1,
        ]);

        return response()->json([
            'message' => 'Demande produit envoyee.',
            'order' => $order->load('items'),
        ], 201);
    }
}
