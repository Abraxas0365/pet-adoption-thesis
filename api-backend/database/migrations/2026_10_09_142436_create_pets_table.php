<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    
public function up(): void
{
    Schema::create('pets', function (Blueprint $table) {
        $table->id();

        // Original identifier from the testing CSV
        $table->string('external_pet_id')->unique();

        // The CSV doesn't contain pet names or photos.
        $table->string('name');
        $table->string('pet_type', 50);
        $table->string('breed')->nullable();
        $table->unsignedInteger('age_months');
        $table->string('sex')->nullable();
        $table->string('color')->nullable();
        $table->string('size', 50)->nullable();
        $table->decimal('weight_kg', 8, 2)->nullable();

        $table->boolean('vaccinated')->default(false);
        $table->boolean('has_medical_condition')->default(false);
        $table->unsignedInteger('time_in_shelter_days')->default(0);

        // Optional fields for later integration with matching
        $table->json('temperament')->nullable();
        $table->string('activity_level')->nullable();
        $table->string('image_url')->nullable();

        // Keep test data separate from official shelter records.
        $table->boolean('is_test_data')->default(false);
        $table->string('status')->default('available');

        $table->timestamps();

        $table->index(['is_test_data', 'status']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pets');
    }
};
