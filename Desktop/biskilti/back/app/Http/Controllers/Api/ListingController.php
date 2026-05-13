<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class ListingController extends Controller
{
    public function index(): JsonResponse
    {
        $hasDiscountPercent = Schema::hasColumn('listings', 'discount_percent');

        $listings = Listing::query()
            ->with('user:id,name')
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Listing $listing): array => [
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
                'condition' => $listing->condition,
                'location' => $listing->location,
                'description' => $listing->description,
                'image_url' => $listing->image_url,
                'contact_preference' => $listing->contact_preference,
                'status' => $listing->status,
                'seller_name' => $listing->user?->name,
                'created_at' => $listing->created_at?->toISOString(),
            ]);

        return response()->json(['listings' => $listings]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);

        if (! $user) {
            return response()->json(['message' => 'Non connecte.'], 401);
        }

        $hasDiscountPercent = Schema::hasColumn('listings', 'discount_percent');
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:120'],
            'brand' => ['nullable', 'string', 'max:120'],
            'model' => ['nullable', 'string', 'max:120'],
            'year' => ['nullable', 'integer', 'min:1970', 'max:2035'],
            'size' => ['nullable', 'string', 'max:80'],
            'color' => ['nullable', 'string', 'max:80'],
            'frame_material' => ['nullable', 'string', 'max:120'],
            'transmission' => ['nullable', 'string', 'max:120'],
            'brakes' => ['nullable', 'string', 'max:120'],
            'wheel_size' => ['nullable', 'string', 'max:80'],
            'price' => ['nullable', 'integer', 'min:0'],
            'condition' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'contact_preference' => ['nullable', 'string', 'max:40'],
        ];

        if ($hasDiscountPercent) {
            $rules['discount_percent'] = ['nullable', 'integer', 'min:0', 'max:100'];
        }

        $data = $request->validate($rules);

        if ($hasDiscountPercent) {
            $data['discount_percent'] = $data['discount_percent'] ?? 0;
        }

        $listing = Listing::create([...$data, 'user_id' => $user->id, 'status' => 'pending']);

        return response()->json([
            'message' => 'Annonce creee avec succes.',
            'listing' => $listing,
        ], 201);
    }

    public function update(Request $request, Listing $listing): JsonResponse
    {
        $user = $this->authenticatedUser($request);

        if (! $user) {
            return response()->json(['message' => 'Non connecte.'], 401);
        }

        if ((int) $listing->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Annonce introuvable pour ce compte.'], 404);
        }

        $hasDiscountPercent = Schema::hasColumn('listings', 'discount_percent');
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:120'],
            'brand' => ['nullable', 'string', 'max:120'],
            'model' => ['nullable', 'string', 'max:120'],
            'year' => ['nullable', 'integer', 'min:1970', 'max:2035'],
            'size' => ['nullable', 'string', 'max:80'],
            'color' => ['nullable', 'string', 'max:80'],
            'frame_material' => ['nullable', 'string', 'max:120'],
            'transmission' => ['nullable', 'string', 'max:120'],
            'brakes' => ['nullable', 'string', 'max:120'],
            'wheel_size' => ['nullable', 'string', 'max:80'],
            'price' => ['nullable', 'integer', 'min:0'],
            'condition' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'contact_preference' => ['nullable', 'string', 'max:40'],
        ];

        if ($hasDiscountPercent) {
            $rules['discount_percent'] = ['nullable', 'integer', 'min:0', 'max:100'];
        }

        $data = $request->validate($rules);

        if ($hasDiscountPercent) {
            $data['discount_percent'] = $data['discount_percent'] ?? 0;
        }

        $listing->update([...$data, 'status' => 'pending']);

        return response()->json([
            'message' => 'Annonce mise a jour.',
            'listing' => $listing->fresh(),
        ]);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'data_url' => ['required', 'string'],
            'file_name' => ['nullable', 'string', 'max:180'],
        ]);

        if (! preg_match('/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/', $data['data_url'], $matches)) {
            return response()->json(['message' => 'Image invalide.'], 422);
        }

        $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
        $binary = base64_decode($matches[2], true);

        if ($binary === false || strlen($binary) > 5 * 1024 * 1024) {
            return response()->json(['message' => 'Image trop grande. Maximum 5 MB.'], 422);
        }

        $baseName = strtolower(pathinfo($data['file_name'] ?? 'listing-image', PATHINFO_FILENAME));
        $baseName = trim(preg_replace('/[^a-z0-9-]+/', '-', $baseName), '-') ?: 'listing-image';
        $baseName = substr($baseName, 0, 48);
        $fileName = time().'-'.bin2hex(random_bytes(4)).'-'.$baseName.'.'.$extension;
        $directory = public_path('uploads/listings');

        File::ensureDirectoryExists($directory);
        File::put($directory.'/'.$fileName, $binary);

        return response()->json([
            'message' => 'Image ajoutee.',
            'image_url' => url('/uploads/listings/'.$fileName),
        ], 201);
    }
}
