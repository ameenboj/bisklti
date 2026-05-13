<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role', 40)->default('buyer')->after('preferred_contact');
            }

            if (! Schema::hasColumn('users', 'status')) {
                $table->string('status', 40)->default('active')->after('role');
            }

            if (! Schema::hasColumn('users', 'verification_status')) {
                $table->string('verification_status', 40)->default('unverified')->after('status');
            }

            if (! Schema::hasColumn('users', 'seller_status')) {
                $table->string('seller_status', 40)->default('none')->after('verification_status');
            }

            if (! Schema::hasColumn('users', 'commission_rate')) {
                $table->unsignedTinyInteger('commission_rate')->default(10)->after('seller_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach ([
                'role',
                'status',
                'verification_status',
                'seller_status',
                'commission_rate',
            ] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
