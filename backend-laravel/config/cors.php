<?php

return [
    'paths' => ['api/*', 'storage/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:3000'),
        'https://voiture-occasion.onrender.com',
        'https://voiture-occasion.vercel.app',
    ]),
    'allowed_origins_patterns' => ['^https://.*\\.onrender\\.com$', '^https://.*\\.vercel\\.app$'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
