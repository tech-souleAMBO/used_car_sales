<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug')->unique();

            $table->uuid('brand_id');
            $table->foreign('brand_id')->references('id')->on('brands')->restrictOnDelete();

            $table->string('model');
            $table->string('version')->nullable();
            $table->integer('year');
            $table->decimal('price', 10, 2);

            $table->integer('mileage');
            $table->string('fuel_type'); // ESSENCE | DIESEL | ELECTRIQUE | HYBRIDE | GPL
            $table->string('transmission'); // MANUELLE | AUTOMATIQUE
            $table->string('body_type')->nullable(); // BERLINE | CITADINE | SUV | ...
            $table->integer('doors')->nullable();
            $table->integer('seats')->nullable();
            $table->integer('power')->nullable();
            $table->string('color')->nullable();

            $table->string('city');
            $table->string('postal_code');
            $table->string('region')->nullable();

            $table->text('description');

            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();

            $table->string('status')->default('DRAFT'); // AVAILABLE | RESERVED | SOLD | DRAFT
            $table->boolean('is_featured')->default(false);
            $table->integer('views_count')->default(0);

            $table->timestamps();

            $table->index('brand_id');
            $table->index('status');
            $table->index('city');
            $table->index('price');
            $table->index('year');
            $table->index('fuel_type');
            $table->index('transmission');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
