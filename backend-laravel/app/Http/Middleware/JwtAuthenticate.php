<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticate
{
    public function __construct(private JwtService $jwtService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization', '');

        if (! str_starts_with($header, 'Bearer ')) {
            return response()->json([
                'statusCode' => 401,
                'message' => 'Authentification requise',
            ], 401);
        }

        $token = substr($header, 7);
        $payload = $this->jwtService->verifyAccessToken($token);

        if (! $payload) {
            return response()->json([
                'statusCode' => 401,
                'message' => 'Token invalide ou expiré',
            ], 401);
        }

        $admin = Admin::find($payload->sub);
        if (! $admin || ! $admin->is_active) {
            return response()->json([
                'statusCode' => 401,
                'message' => 'Compte admin introuvable ou désactivé',
            ], 401);
        }

        // Rend l'admin courant disponible dans le contrôleur via $request->attributes->get('admin')
        $request->attributes->set('admin', $admin);

        return $next($request);
    }
}
