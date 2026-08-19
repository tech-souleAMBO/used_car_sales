<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        /** @var \App\Models\Admin|null $admin */
        $admin = $request->attributes->get('admin');

        if (! $admin || ! in_array($admin->role, $roles, true)) {
            return response()->json([
                'statusCode' => 403,
                'message' => 'Accès refusé : rôle insuffisant',
            ], 403);
        }

        return $next($request);
    }
}
