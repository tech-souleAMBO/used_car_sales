<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * Attributs qui ne doivent jamais être présents dans les logs d'exception.
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        // Réponses JSON homogènes pour toute erreur, cohérent avec l'ancienne API NestJS
        $this->renderable(function (ValidationException $e, Request $request) {
            return response()->json([
                'statusCode' => 422,
                'message' => $e->validator->errors()->first() ?? 'Données invalides',
                'errors' => $e->errors(),
            ], 422);
        });

        $this->renderable(function (AuthenticationException $e, Request $request) {
            return response()->json([
                'statusCode' => 401,
                'message' => 'Authentification requise',
            ], 401);
        });

        $this->renderable(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

            return response()->json([
                'statusCode' => $status,
                'message' => $status === 500 ? 'Erreur interne du serveur' : $e->getMessage(),
            ], $status);
        });
    }
}
