<?php

return [
    'access_secret' => env('JWT_ACCESS_SECRET'),
    'access_ttl' => (int) env('JWT_ACCESS_TTL', 15), // minutes

    'refresh_secret' => env('JWT_REFRESH_SECRET'),
    'refresh_ttl' => (int) env('JWT_REFRESH_TTL', 10080), // minutes (7 jours par défaut)
];
