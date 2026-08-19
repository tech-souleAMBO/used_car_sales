<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('admin_id');
            $table->string('admin_email');
            $table->string('action'); // CREATE | UPDATE | DELETE
            $table->string('entity_type'); // Vehicle | Brand
            $table->uuid('entity_id')->nullable();
            $table->string('summary');
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->index('created_at');
            $table->index('entity_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
