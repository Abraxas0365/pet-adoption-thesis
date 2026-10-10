<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Pet::query()
            ->where('status', 'available')
            ->orderBy('id');

        if ($request->boolean('test_only')) {
            $query->where('is_test_data', true);
        }

        if ($request->filled('species')) {
            $query->where(
                'pet_type',
                strtolower($request->string('species')->toString())
            );
        }

        $pets = $query->paginate($request->integer('per_page', 24));

        return response()->json($pets);
    }

    public function show(Pet $pet): JsonResponse
    {
        return response()->json($pet);
    }
}