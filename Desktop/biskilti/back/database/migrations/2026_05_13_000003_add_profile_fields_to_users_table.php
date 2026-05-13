<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'address')) {
                $table->string('address')->nullable()->after('phone');
            }

            if (! Schema::hasColumn('users', 'city')) {
                $table->string('city', 120)->nullable()->after('address');
            }

            if (! Schema::hasColumn('users', 'preferred_contact')) {
                $table->string('preferred_contact', 40)->default('phone')->after('city');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach (['address', 'city', 'preferred_contact'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
