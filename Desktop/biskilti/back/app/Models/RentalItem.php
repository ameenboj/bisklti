<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RentalItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'image',
        'base_rate',
        'per_km_rate',
        'capacity',
        'is_available',
    ];

    protected $casts = ['is_available' => 'boolean'];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
