<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Listing extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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
        'discount_percent',
        'is_featured',
        'stock_quantity',
        'condition',
        'location',
        'description',
        'image_url',
        'contact_preference',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
