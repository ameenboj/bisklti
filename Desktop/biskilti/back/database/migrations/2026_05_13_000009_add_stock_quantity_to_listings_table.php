<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table): void {
            if (! Schema::hasColumn('listings', 'stock_quantity')) {
                $table->unsignedInteger('stock_quantity')->default(1)->after('is_featured');
            }
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table): void {
            if (Schema::hasColumn('listings', 'stock_quantity')) {
                $table->dropColumn('stock_quantity');
            }
        });
    }
};
