<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate([
            'email' => 'password@gmail.com',
        ], [
            'name' => 'Password User',
            'phone' => '+216 00 000 000',
            'password' => Hash::make('pass'),
            'role' => 'admin',
            'status' => 'active',
            'verification_status' => 'verified',
            'seller_status' => 'approved',
        ]);
    }
}
