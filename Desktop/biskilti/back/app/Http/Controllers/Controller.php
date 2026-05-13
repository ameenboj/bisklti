<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function authenticatedUser(Request $request): ?User
    {
        $token = (string) $request->bearerToken();

        if ($token === '') {
            return null;
        }

        $apiToken = ApiToken::query()
            ->with('user')
            ->where('token_hash', hash('sha256', $token))
            ->where(function ($query): void {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        if (! $apiToken?->user) {
            return null;
        }

        $apiToken->forceFill(['last_used_at' => now()])->save();

        return $apiToken->user;
    }

    protected function deleteCurrentToken(Request $request): void
    {
        $token = (string) $request->bearerToken();

        if ($token === '') {
            return;
        }

        ApiToken::query()
            ->where('token_hash', hash('sha256', $token))
            ->delete();
    }

    protected function publicUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? '',
            'address' => $user->address ?? '',
            'city' => $user->city ?? '',
            'preferredContact' => $user->preferred_contact ?? 'phone',
            'role' => $user->role ?? 'buyer',
            'status' => $user->status ?? 'active',
            'verificationStatus' => $user->verification_status ?? 'unverified',
            'sellerStatus' => $user->seller_status ?? 'none',
            'commissionRate' => $user->commission_rate ?? 10,
            'createdAt' => $user->created_at?->toISOString(),
        ];
    }
}
