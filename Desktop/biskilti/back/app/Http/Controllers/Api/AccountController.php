<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ExchangeRequest;
use App\Models\Listing;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AccountController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);

        if (! $user) {
            return response()->json(['message' => 'Non connecte.'], 401);
        }

        return response()->json($this->accountPayload($user));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);

        if (! $user) {
            return response()->json(['message' => 'Non connecte.'], 401);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'preferredContact' => ['nullable', 'string', 'max:40'],
        ]);

        $user->update([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'preferred_contact' => $data['preferredContact'] ?? 'phone',
        ]);

        return response()->json([
            'message' => 'Profil mis a jour.',
            'user' => $this->publicUser($user->fresh()),
            'account' => $this->accountPayload($user->fresh()),
        ]);
    }

    private function accountPayload(User $user): array
    {
        $bookingsQuery = Booking::query()
            ->where('user_id', $user->id)
            ->orWhere('customer_email', $user->email);
        $ordersQuery = Order::query()
            ->where('user_id', $user->id)
            ->orWhere('customer_email', $user->email);
        $listingsQuery = Listing::query()->where('user_id', $user->id);
        $exchangesQuery = ExchangeRequest::query()->where('user_id', $user->id);
        $listingColumns = [
            'id',
            'title',
            'category',
            'brand',
            'model',
            'year',
            'size',
            'color',
            'frame_material',
            'transmission',
            'brakes',
            'wheel_size',
            'price',
            'condition',
            'location',
            'description',
            'image_url',
            'contact_preference',
            'status',
            'created_at',
        ];

        if (Schema::hasColumn('listings', 'discount_percent')) {
            $listingColumns[] = 'discount_percent';
        }

        return [
            'user' => $this->publicUser($user),
            'stats' => [
                'bookings' => (clone $bookingsQuery)->count(),
                'orders' => (clone $ordersQuery)->count(),
                'listings' => (clone $listingsQuery)->count(),
                'exchanges' => (clone $exchangesQuery)->count(),
                'contacts' => 0,
            ],
            'activity' => [
                'bookings' => (clone $bookingsQuery)
                    ->latest()
                    ->limit(20)
                    ->get()
                    ->map(fn (Booking $booking): array => [
                        'id' => $booking->id,
                        'title' => $booking->rentalItem?->title ?? $booking->notes ?? 'Reservation location',
                        'booking_date' => $booking->booking_date?->toDateString(),
                        'status' => $booking->status,
                        'notes' => $booking->notes,
                        'created_at' => $booking->created_at?->toISOString(),
                    ])
                    ->all(),
                'orders' => (clone $ordersQuery)
                    ->with('items')
                    ->latest()
                    ->limit(20)
                    ->get()
                    ->map(fn (Order $order): array => [
                        'id' => $order->id,
                        'title' => $order->items->first()?->title ?? 'Commande boutique',
                        'total' => $order->total,
                        'status' => $order->status,
                        'notes' => $order->notes,
                        'created_at' => $order->created_at?->toISOString(),
                    ])
                    ->all(),
                'listings' => (clone $listingsQuery)
                    ->latest()
                    ->limit(20)
                    ->get($listingColumns)
                    ->map(fn (Listing $listing): array => [
                        ...$listing->toArray(),
                        'discount_percent' => $listing->discount_percent ?? 0,
                    ])
                    ->toArray(),
                'exchanges' => (clone $exchangesQuery)
                    ->latest()
                    ->limit(20)
                    ->get(['id', 'offered_item', 'wanted_item', 'description', 'status', 'created_at'])
                    ->toArray(),
                'contacts' => [],
            ],
        ];
    }

}
