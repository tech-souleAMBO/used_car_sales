<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\AdminResource;
use App\Models\Admin;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private const REFRESH_COOKIE_NAME = 'refresh_token';

    private const REFRESH_COOKIE_MINUTES = 7 * 24 * 60; // 7 jours, doit correspondre à JWT_REFRESH_TTL

    public function __construct(private JwtService $jwtService) {}

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $admin = Admin::where('email', $data['email'])->first();

        if (! $admin || ! $admin->is_active || ! Hash::check($data['password'], $admin->password_hash)) {
            return response()->json([
                'statusCode' => 401,
                'message' => 'Identifiants invalides',
            ], 401);
        }

        $accessToken = $this->jwtService->generateAccessToken($admin->id, $admin->email, $admin->role);
        $refreshToken = $this->jwtService->generateRefreshToken($admin->id, $admin->email, $admin->role);

        $admin->update(['refresh_token_hash' => Hash::make($refreshToken)]);

        return response()->json([
            'accessToken' => $accessToken,
            'admin' => new AdminResource($admin),
        ])->withCookie($this->buildRefreshCookie($refreshToken));
    }

    public function refresh(Request $request)
    {
        $refreshToken = $request->cookie(self::REFRESH_COOKIE_NAME);

        if (! $refreshToken) {
            return response()->json([
                'statusCode' => 401,
                'message' => 'Refresh token manquant',
            ], 401);
        }

        $payload = $this->jwtService->verifyRefreshToken($refreshToken);
        if (! $payload) {
            return response()->json([
                'statusCode' => 401,
                'message' => 'Refresh token invalide ou expiré',
            ], 401);
        }

        $admin = Admin::find($payload->sub);
        if (! $admin || ! $admin->refresh_token_hash || ! Hash::check($refreshToken, $admin->refresh_token_hash)) {
            return response()->json([
                'statusCode' => 401,
                'message' => 'Session invalide, veuillez vous reconnecter',
            ], 401);
        }

        $newAccessToken = $this->jwtService->generateAccessToken($admin->id, $admin->email, $admin->role);
        $newRefreshToken = $this->jwtService->generateRefreshToken($admin->id, $admin->email, $admin->role);

        $admin->update(['refresh_token_hash' => Hash::make($newRefreshToken)]);

        return response()->json([
            'accessToken' => $newAccessToken,
        ])->withCookie($this->buildRefreshCookie($newRefreshToken));
    }

    public function logout(Request $request)
    {
        /** @var Admin $admin */
        $admin = $request->attributes->get('admin');
        $admin->update(['refresh_token_hash' => null]);

        return response()->json([
            'message' => 'Déconnexion réussie',
        ])->withCookie(Cookie::forget(self::REFRESH_COOKIE_NAME, '/api/v1/auth'));
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $admin = Admin::where('email', $request->email)->first();

        // Toujours renvoyer le même message pour ne pas révéler si l'email existe
        if (! $admin || ! $admin->is_active) {
            return response()->json(['message' => 'Si cet email existe, un lien de réinitialisation vous a été envoyé.']);
        }

        $token = Str::random(64);
        $admin->update([
            'password_reset_token' => $token,
            'password_reset_expires' => now()->addHours(2),
        ]);

        $resetUrl = config('app.url', 'http://localhost:3000')."/admin/reset-password?token={$token}";

        Mail::raw(
            "Bonjour,\n\n"
            ."Vous avez demandé la réinitialisation de votre mot de passe.\n\n"
            ."Cliquez sur le lien ci-dessous (valable 2 heures) :\n"
            ."{$resetUrl}\n\n"
            ."Si vous n'avez pas fait cette demande, ignorez cet email.",
            function ($m) use ($resetUrl) {
                $m->to('alexambo197@gmail.com')
                    ->subject('Réinitialisation de votre mot de passe')
                    ->from(config('mail.from.address'), config('mail.from.name'));
            }
        );

        return response()->json(['message' => 'Si cet email existe, un lien de réinitialisation vous a été envoyé.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $admin = Admin::where('password_reset_token', $request->token)
            ->where('password_reset_expires', '>', now())
            ->first();

        if (! $admin) {
            return response()->json(['statusCode' => 400, 'message' => 'Lien invalide ou expiré. Veuillez en demander un nouveau.'], 400);
        }

        $admin->update([
            'password_hash' => Hash::make($request->password),
            'password_reset_token' => null,
            'password_reset_expires' => null,
        ]);

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.']);
    }

    private function buildRefreshCookie(string $refreshToken)
    {
        return Cookie::make(
            name: self::REFRESH_COOKIE_NAME,
            value: $refreshToken,
            minutes: self::REFRESH_COOKIE_MINUTES,
            path: '/api/v1/auth',
            domain: null,
            secure: app()->environment('production'),
            httpOnly: true,
            raw: false,
            sameSite: 'lax',
        );
    }
}
