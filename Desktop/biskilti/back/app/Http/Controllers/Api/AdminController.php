<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AdminController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $admin = $this->adminFromBearer($request);

        if (! $admin) {
            return response()->json(['message' => 'Acces admin requis.'], 403);
        }

        $users = User::query()->latest()->get();
        $orders = Order::query()->latest()->limit(50)->get();
        $hasDiscountPercent = Schema::hasColumn('listings', 'discount_percent');
        $hasFeatured = Schema::hasColumn('listings', 'is_featured');
        $hasStock = Schema::hasColumn('listings', 'stock_quantity');
        $products = Listing::query()
            ->with('user')
            ->orderByDesc($hasFeatured ? 'is_featured' : 'id')
            ->latest()
            ->limit(50)
            ->get();
        $sellerUsers = $users->filter(fn (User $user): bool => in_array($user->role, ['seller', 'admin'], true));

        return response()->json([
            'metrics' => [
                'totalRevenue' => $orders->sum('total'),
                'totalOrders' => Order::query()->count(),
                'totalUsers' => $users->count(),
                'totalSellers' => $sellerUsers->count(),
                'pendingDeliveries' => Order::query()->where('status', 'pending')->count(),
                'refundRequests' => Order::query()->whereIn('status', ['refund', 'cancelled'])->count(),
                'lowStockAlerts' => max(0, 6 - $products->count()),
                'pendingApprovals' => Listing::query()->where('status', 'pending')->count(),
            ],
            'analytics' => [
                'monthlyRevenue' => [
                    ['month' => 'Jan', 'revenue' => 2800, 'orders' => 9],
                    ['month' => 'Feb', 'revenue' => 3600, 'orders' => 11],
                    ['month' => 'Mar', 'revenue' => 4100, 'orders' => 13],
                    ['month' => 'Apr', 'revenue' => 5200, 'orders' => 15],
                    ['month' => 'May', 'revenue' => 6700, 'orders' => 18],
                    ['month' => 'Jun', 'revenue' => 7400, 'orders' => 21],
                ],
            ],
            'notifications' => [
                ['title' => 'Produits en attente', 'body' => Listing::query()->where('status', 'pending')->count().' annonces doivent etre verifiees.', 'level' => 'warning'],
                ['title' => 'Livraisons', 'body' => Order::query()->where('status', 'pending')->count().' commandes sont encore en attente.', 'level' => 'warning'],
            ],
            'users' => $users,
            'sellers' => $sellerUsers->values(),
            'products' => $products->map(fn (Listing $listing): array => [
                'id' => $listing->id,
                'title' => $listing->title,
                'category' => $listing->category,
                'brand' => $listing->brand,
                'model' => $listing->model,
                'year' => $listing->year,
                'size' => $listing->size,
                'color' => $listing->color,
                'frame_material' => $listing->frame_material,
                'transmission' => $listing->transmission,
                'brakes' => $listing->brakes,
                'wheel_size' => $listing->wheel_size,
                'price' => $listing->price,
                'discount_percent' => $hasDiscountPercent ? ($listing->discount_percent ?? 0) : 0,
                'is_featured' => $hasFeatured ? (bool) $listing->is_featured : false,
                'stock_quantity' => $hasStock ? ($listing->stock_quantity ?? 1) : 1,
                'condition' => $listing->condition,
                'location' => $listing->location,
                'description' => $listing->description,
                'image_url' => $listing->image_url,
                'contact_preference' => $listing->contact_preference,
                'status' => $listing->status,
                'seller_name' => $listing->user?->name,
                'created_at' => $listing->created_at?->toISOString(),
            ]),
            'orders' => $orders,
            'activities' => [],
        ]);
    }

    public function updateListing(Request $request, Listing $listing): JsonResponse
    {
        $admin = $this->adminFromBearer($request);

        if (! $admin) {
            return response()->json(['message' => 'Acces admin requis.'], 403);
        }

        $hasDiscountPercent = Schema::hasColumn('listings', 'discount_percent');
        $hasFeatured = Schema::hasColumn('listings', 'is_featured');
        $hasStock = Schema::hasColumn('listings', 'stock_quantity');
        $rules = [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'nullable', 'string', 'max:120'],
            'brand' => ['sometimes', 'nullable', 'string', 'max:120'],
            'model' => ['sometimes', 'nullable', 'string', 'max:120'],
            'year' => ['sometimes', 'nullable', 'integer', 'min:1970', 'max:2035'],
            'size' => ['sometimes', 'nullable', 'string', 'max:80'],
            'color' => ['sometimes', 'nullable', 'string', 'max:80'],
            'frame_material' => ['sometimes', 'nullable', 'string', 'max:120'],
            'transmission' => ['sometimes', 'nullable', 'string', 'max:120'],
            'brakes' => ['sometimes', 'nullable', 'string', 'max:120'],
            'wheel_size' => ['sometimes', 'nullable', 'string', 'max:80'],
            'price' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'condition' => ['sometimes', 'nullable', 'string', 'max:120'],
            'location' => ['sometimes', 'nullable', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'contact_preference' => ['sometimes', 'nullable', 'string', 'max:40'],
            'status' => ['sometimes', 'required', 'in:pending,approved,rejected'],
        ];

        if ($hasDiscountPercent) {
            $rules['discount_percent'] = ['sometimes', 'nullable', 'integer', 'min:0', 'max:100'];
        }

        if ($hasFeatured) {
            $rules['is_featured'] = ['sometimes', 'boolean'];
        }

        if ($hasStock) {
            $rules['stock_quantity'] = ['sometimes', 'nullable', 'integer', 'min:0'];
        }

        $data = $request->validate($rules);
        $listing->update($data);

        return response()->json([
            'message' => 'Produit mis a jour.',
            'listing' => $listing->fresh(),
        ]);
    }

    public function importListings(Request $request): JsonResponse
    {
        $admin = $this->adminFromBearer($request);

        if (! $admin) {
            return response()->json(['message' => 'Acces admin requis.'], 403);
        }

        $data = $request->validate([
            'products' => ['required', 'array', 'min:1', 'max:50'],
            'products.*.title' => ['required', 'string', 'max:255'],
            'products.*.category' => ['nullable', 'string', 'max:120'],
            'products.*.brand' => ['nullable', 'string', 'max:120'],
            'products.*.model' => ['nullable', 'string', 'max:120'],
            'products.*.price' => ['nullable', 'integer', 'min:0'],
            'products.*.discount_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'products.*.stock_quantity' => ['nullable', 'integer', 'min:0'],
            'products.*.condition' => ['nullable', 'string', 'max:120'],
            'products.*.location' => ['nullable', 'string', 'max:120'],
            'products.*.image_url' => ['nullable', 'string', 'max:500'],
        ]);

        $hasDiscountPercent = Schema::hasColumn('listings', 'discount_percent');
        $hasFeatured = Schema::hasColumn('listings', 'is_featured');
        $hasStock = Schema::hasColumn('listings', 'stock_quantity');
        $created = collect($data['products'])->map(function (array $product) use ($admin, $hasDiscountPercent, $hasFeatured, $hasStock): Listing {
            if (! $hasDiscountPercent) {
                unset($product['discount_percent']);
            }

            if ($hasFeatured) {
                $product['is_featured'] = false;
            }

            if ($hasStock) {
                $product['stock_quantity'] = $product['stock_quantity'] ?? 1;
            } else {
                unset($product['stock_quantity']);
            }

            return Listing::create([
                ...$product,
                'user_id' => $admin->id,
                'status' => 'pending',
            ]);
        });

        return response()->json([
            'message' => $created->count().' produits importes.',
            'created' => $created,
        ], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $admin = $this->adminFromBearer($request);

        if (! $admin) {
            return response()->json(['message' => 'Acces admin requis.'], 403);
        }

        $data = $request->validate([
            'role' => ['required', 'in:buyer,seller,admin'],
            'status' => ['required', 'in:active,suspended,banned'],
            'verification_status' => ['required', 'in:unverified,pending,verified'],
            'seller_status' => ['required', 'in:none,pending,approved,rejected'],
            'commission_rate' => ['required', 'integer', 'min:0', 'max:50'],
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis a jour.',
            'user' => $user->fresh(),
        ]);
    }

    private function adminFromBearer(Request $request): ?User
    {
        $user = $this->authenticatedUser($request);

        return $user?->role === 'admin' ? $user : null;
    }
}
