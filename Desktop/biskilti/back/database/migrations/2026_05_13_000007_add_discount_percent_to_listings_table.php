<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table): void {
            if (! Schema::hasColumn('listings', 'discount_percent')) {
                $table->unsignedTinyInteger('discount_percent')->default(0)->after('price');
            }
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table): void {
            if (Schema::hasColumn('listings', 'discount_percent')) {
                $table->dropColumn('discount_percent');
            }
        });
    }
};
