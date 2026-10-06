<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TestController extends Controller
{
    public function testPython()
    {
        $response = Http::get('http://localhost:8001/test/json');

        // echo "Response from FastAPI microservice: " . $response->body() . "\n";

        return response()->json($response->json(), $response->status());
    }
}
