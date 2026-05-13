<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('rental_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->date('booking_date')->nullable();
            $table->string('status', 40)->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['booking_date', 'status']);
            $table->index('customer_email');
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->unsignedInteger('total')->default(0);
            $table->string('status', 40)->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('customer_email');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->unsignedInteger('unit_price')->default(0);
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->index('product_id');
        });

        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('category', 120)->nullable();
            $table->string('brand', 120)->nullable();
            $table->string('model', 120)->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->string('size', 80)->nullable();
            $table->string('color', 80)->nullable();
            $table->string('frame_material', 120)->nullable();
            $table->string('transmission', 120)->nullable();
            $table->string('brakes', 120)->nullable();
            $table->string('wheel_size', 80)->nullable();
            $table->unsignedInteger('price')->nullable();
            $table->unsignedTinyInteger('discount_percent')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('stock_quantity')->default(1);
            $table->string('condition', 120)->nullable();
            $table->string('location', 120)->nullable();
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('contact_preference', 40)->default('phone');
            $table->string('status', 40)->default('pending');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['category', 'status']);
            $table->index(['status', 'created_at']);
            $table->index(['brand', 'model']);
            $table->index('price');
        });

        Schema::create('exchange_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('offered_item');
            $table->string('wanted_item')->nullable();
            $table->text('description')->nullable();
            $table->string('status', 40)->default('pending');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('contact_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('topic');
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('message')->nullable();
            $table->string('status', 40)->default('new');
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_requests');
        Schema::dropIfExists('exchange_requests');
        Schema::dropIfExists('listings');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('bookings');
    }
};
