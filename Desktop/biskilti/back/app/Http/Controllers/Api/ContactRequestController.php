<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactRequestController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'topic' => ['required', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'message' => ['nullable', 'string'],
        ]);

        $contact = ContactRequest::create([...$data, 'status' => 'new']);

        return response()->json([
            'message' => 'Demande envoyee. Bisklet vous contactera rapidement.',
            'contact' => $contact,
        ], 201);
    }
}
