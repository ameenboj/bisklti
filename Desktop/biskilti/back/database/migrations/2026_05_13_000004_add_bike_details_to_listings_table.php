<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            if (! Schema::hasColumn('listings', 'brand')) {
                $table->string('brand', 120)->nullable()->after('category');
            }

            if (! Schema::hasColumn('listings', 'model')) {
                $table->string('model', 120)->nullable()->after('brand');
            }

            if (! Schema::hasColumn('listings', 'year')) {
                $table->unsignedSmallInteger('year')->nullable()->after('model');
            }

            if (! Schema::hasColumn('listings', 'size')) {
                $table->string('size', 80)->nullable()->after('year');
            }

            if (! Schema::hasColumn('listings', 'color')) {
                $table->string('color', 80)->nullable()->after('size');
            }

            if (! Schema::hasColumn('listings', 'frame_material')) {
                $table->string('frame_material', 120)->nullable()->after('color');
            }

            if (! Schema::hasColumn('listings', 'transmission')) {
                $table->string('transmission', 120)->nullable()->after('frame_material');
            }

            if (! Schema::hasColumn('listings', 'brakes')) {
                $table->string('brakes', 120)->nullable()->after('transmission');
            }

            if (! Schema::hasColumn('listings', 'wheel_size')) {
                $table->string('wheel_size', 80)->nullable()->after('brakes');
            }

            if (! Schema::hasColumn('listings', 'image_url')) {
                $table->string('image_url', 500)->nullable()->after('description');
            }

            if (! Schema::hasColumn('listings', 'contact_preference')) {
                $table->string('contact_preference', 40)->default('phone')->after('image_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            foreach ([
                'brand',
                'model',
                'year',
                'size',
                'color',
                'frame_material',
                'transmission',
                'brakes',
                'wheel_size',
                'image_url',
                'contact_preference',
            ] as $column) {
                if (Schema::hasColumn('listings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
