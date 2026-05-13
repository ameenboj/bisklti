<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'description',
        'image',
        'price',
        'old_price',
        'discount_percent',
        'availability',
        'rating',
        'reviews_count',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
        'rating' => 'decimal:1',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
