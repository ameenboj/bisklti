<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\RentalItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);
        $data = $request->validate([
            'rental_title' => ['required_without:rental_item_id', 'string', 'max:255'],
            'rental_item_id' => ['nullable', 'integer', 'exists:rental_items,id'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:40'],
            'booking_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $rentalId = $data['rental_item_id'] ?? null;

        if (! $rentalId && isset($data['rental_title'])) {
            $rentalId = RentalItem::firstOrCreate(
                ['slug' => str($data['rental_title'])->slug()->toString()],
                ['title' => $data['rental_title'], 'description' => 'Created from frontend booking']
            )->id;
        }

        $booking = Booking::create([
            ...$data,
            'user_id' => $user?->id,
            'rental_item_id' => $rentalId,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Booking cree avec succes.',
            'booking' => $booking,
        ], 201);
    }
}
