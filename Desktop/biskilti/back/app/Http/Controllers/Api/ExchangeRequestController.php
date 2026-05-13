<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExchangeRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExchangeRequestController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);
        $data = $request->validate([
            'offered_item' => ['required', 'string', 'max:255'],
            'wanted_item' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $exchange = ExchangeRequest::create([...$data, 'user_id' => $user?->id, 'status' => 'pending']);

        return response()->json([
            'message' => 'Demande d echange envoyee.',
            'exchange' => $exchange,
        ], 201);
    }
}
