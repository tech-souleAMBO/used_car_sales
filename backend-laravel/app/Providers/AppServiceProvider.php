<?php

namespace App\Providers;

use App\Services\ActivityLogService;
use App\Services\JwtService;
use App\Services\StorageService;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Enregistre les services applicatifs comme singletons.
     */
    public function register(): void
    {
        $this->app->singleton(JwtService::class);
        $this->app->singleton(StorageService::class);
        $this->app->singleton(ActivityLogService::class);
    }

    public function boot(): void
    {
        JsonResource::withoutWrapping();
    }
}
