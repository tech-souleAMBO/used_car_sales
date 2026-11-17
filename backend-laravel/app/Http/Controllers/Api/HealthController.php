<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    /**
     * Point de santé utilisé par le health check de Render (et par le frontend
     * pour vérifier que l'API répond). Volontairement synchrone et sans accès
     * à la base : il doit répondre en quelques millisecondes, même si la
     * base de données est indisponible.
     */
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'autolara-backend',
            'time' => now()->toIso8601String(),
        ]);
    }
}
