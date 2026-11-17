<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * Point de santé utilisé par le health check de Render (et par le frontend
     * pour vérifier que l'API répond). Volontairement synchrone : il doit
     * répondre en quelques millisecondes, même si la base est indisponible.
     *
     * Avec ?db=1, on teste aussi la connexion à la base (diagnostic, peut
     * prendre plusieurs secondes si la base est injoignable).
     */
    public function __invoke(Request $request): JsonResponse
    {
        $payload = [
            'status' => 'ok',
            'service' => 'autolara-backend',
            'time' => now()->toIso8601String(),
        ];

        if ($request->boolean('db')) {
            try {
                DB::select('select 1');
                $payload['database'] = 'up';
            } catch (\Throwable $e) {
                $payload['database'] = 'down';
                $payload['status'] = 'degraded';
                // Diagnostic temporaire : permet de lire l'erreur exacte de
                // connexion sans avoir accès aux logs Render. A retirer (ou
                // à gate derriere config('app.debug')) une fois la base
                // rétablie.
                $payload['database_error'] = mb_substr($e->getMessage(), 0, 400);
                $connection = DB::connection();
                $payload['database_target'] = sprintf(
                    '%s@%s:%s/%s',
                    $connection->getConfig('username'),
                    $connection->getConfig('host'),
                    $connection->getConfig('port'),
                    $connection->getConfig('database'),
                );
            }
        }

        return response()->json($payload, $payload['status'] === 'ok' ? 200 : 503);
    }
}
