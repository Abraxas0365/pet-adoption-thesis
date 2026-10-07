<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MatchingController extends Controller
{
    public function match(Request $request)
    {
        $response = Http::timeout(5)
            ->post('http://127.0.0.1:8001/matching/match', [
                'adopter' => $request->input('adopter'),
                'pet' => $request->input('pet'),
            ]);

        if ($response->failed()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Matching service failed.',
                'details' => $response->json(),
            ], 502);
        }

        return response()->json(
            $response->json()
        );
    }
}