<?php

namespace App\Services;

use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\SignatureInvalidException;

class JwtService
{
    /**
     * Génère un access token (courte durée) signé avec la clé "jwt.access_secret".
     */
    public function generateAccessToken(string $adminId, string $email, string $role): string
    {
        $ttlMinutes = (int) config('jwt.access_ttl');

        return $this->encode([
            'sub' => $adminId,
            'email' => $email,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + ($ttlMinutes * 60),
        ], (string) config('jwt.access_secret'));
    }

    /**
     * Génère un refresh token (longue durée) signé avec la clé "jwt.refresh_secret".
     */
    public function generateRefreshToken(string $adminId, string $email, string $role): string
    {
        $ttlMinutes = (int) config('jwt.refresh_ttl');

        return $this->encode([
            'sub' => $adminId,
            'email' => $email,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + ($ttlMinutes * 60),
        ], (string) config('jwt.refresh_secret'));
    }

    /**
     * Décode et vérifie un access token. Retourne le payload ou null si invalide/expiré.
     */
    public function verifyAccessToken(string $token): ?object
    {
        return $this->decode($token, (string) config('jwt.access_secret'));
    }

    /**
     * Décode et vérifie un refresh token. Retourne le payload ou null si invalide/expiré.
     */
    public function verifyRefreshToken(string $token): ?object
    {
        return $this->decode($token, (string) config('jwt.refresh_secret'));
    }

    private function encode(array $payload, string $secret): string
    {
        return JWT::encode($payload, $secret, 'HS256');
    }

    private function decode(string $token, string $secret): ?object
    {
        try {
            return JWT::decode($token, new Key($secret, 'HS256'));
        } catch (ExpiredException|SignatureInvalidException|\UnexpectedValueException $e) {
            return null;
        }
    }
}
