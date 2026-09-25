<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class HealthController extends Controller
{
    public function check()
    {
        $database = false;
        $microservice = false;

        // Check PostgreSQL
        try {
            DB::connection()->getPdo();
            $database = true;
        } catch (\Throwable $e) {
            //
        }

        // Check FastAPI microservice
        try {
            $response = Http::get('http://localhost:8001/health');

            $microservice = $response->successful();
        } catch (\Throwable $e) {
            //
        }

        $healthy = $database && $microservice;

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'service' => 'api-backend',
            'database' => $database ? 'ok' : 'unavailable',
            'microservice' => $microservice ? 'ok' : 'unavailable',
        ], $healthy ? 200 : 503);
    }
}