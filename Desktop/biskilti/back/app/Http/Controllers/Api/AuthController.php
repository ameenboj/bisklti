<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:40'],
            'password' => ['required', 'string', 'min:4'],
        ]);

        $user = User::create($data);

        return response()->json([
            'message' => 'Compte cree avec succes.',
            'token' => $this->issueToken($user),
            'user' => $this->publicUser($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($data['email']))->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Email ou mot de passe incorrect.',
            ]);
        }

        return response()->json([
            'message' => 'Connexion reussie.',
            'token' => $this->issueToken($user),
            'user' => $this->publicUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);

        if (! $user) {
            return response()->json(['message' => 'Non connecte.'], 401);
        }

        return response()->json(['user' => $this->publicUser($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->deleteCurrentToken($request);

        return response()->json(['message' => 'Deconnecte.']);
    }

    private function issueToken(User $user): string
    {
        $plainTextToken = bin2hex(random_bytes(32));

        ApiToken::create([
            'user_id' => $user->id,
            'name' => 'frontend',
            'token_hash' => hash('sha256', $plainTextToken),
        ]);

        return $plainTextToken;
    }
}
