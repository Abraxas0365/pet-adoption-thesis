<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    protected $fillable = [
        'external_pet_id',
        'name',
        'pet_type',
        'breed',
        'age_months',
        'sex',
        'color',
        'size',
        'weight_kg',
        'vaccinated',
        'has_medical_condition',
        'time_in_shelter_days',
        'temperament',
        'activity_level',
        'image_url',
        'is_test_data',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'age_months' => 'integer',
            'weight_kg' => 'float',
            'vaccinated' => 'boolean',
            'has_medical_condition' => 'boolean',
            'time_in_shelter_days' => 'integer',
            'temperament' => 'array',
            'is_test_data' => 'boolean',
        ];
    }
}