<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('type', 40)->default('shop');
            $table->timestamps();

            $table->index('type');
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('price');
            $table->unsignedInteger('old_price')->nullable();
            $table->unsignedTinyInteger('discount_percent')->default(0);
            $table->string('availability')->default('En stock');
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->json('tags')->nullable();
            $table->timestamps();

            $table->index(['category_id', 'availability']);
            $table->index('price');
        });

        Schema::create('rental_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('base_rate')->default(0);
            $table->unsignedInteger('per_km_rate')->default(0);
            $table->unsignedInteger('capacity')->default(1);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->index('is_available');
            $table->index('base_rate');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_items');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
