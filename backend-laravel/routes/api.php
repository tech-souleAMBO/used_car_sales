<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ComparisonController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

// ==================== Auth ====================
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth.jwt');

// ==================== Vehicles - public ====================
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{slug}', [VehicleController::class, 'showBySlug']);

// ==================== Vehicles - admin ====================
Route::middleware(['auth.jwt', 'role:ADMIN,SUPERADMIN'])->group(function () {
    Route::get('/vehicles/admin/by-id/{id}', [VehicleController::class, 'showById']);
    Route::get('/vehicles/admin/search', [VehicleController::class, 'adminSearch']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::patch('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);
    Route::post('/vehicles/{id}/images', [VehicleController::class, 'addImages']);
    Route::delete('/vehicles/{id}/images/{imageId}', [VehicleController::class, 'removeImage']);
});

// ==================== Brands ====================
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);
Route::middleware(['auth.jwt', 'role:ADMIN,SUPERADMIN'])->group(function () {
    Route::post('/brands', [BrandController::class, 'store']);
    Route::patch('/brands/{id}', [BrandController::class, 'update']);
});
Route::middleware(['auth.jwt', 'role:SUPERADMIN'])->delete('/brands/{id}', [BrandController::class, 'destroy']);

// ==================== Favorites & comparateur (publics, basés sur sessionId) ====================
Route::get('/favorites/{sessionId}', [FavoriteController::class, 'index']);
Route::get('/favorites/{sessionId}/check', [FavoriteController::class, 'checkIds']);
Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);

Route::get('/comparisons/{sessionId}', [ComparisonController::class, 'index']);
Route::get('/comparisons/{sessionId}/check', [ComparisonController::class, 'checkIds']);
Route::post('/comparisons/toggle', [ComparisonController::class, 'toggle']);
Route::delete('/comparisons/{sessionId}', [ComparisonController::class, 'clear']);

// ==================== Contact ====================
Route::post('/contact', [ContactController::class, 'store']);
Route::middleware('auth.jwt')->group(function () {
    Route::get('/contact', [ContactController::class, 'index']);
    Route::patch('/contact/{id}/read', [ContactController::class, 'markAsRead']);
});

// ==================== Upload (admin) ====================
Route::middleware('auth.jwt')->post('/upload/images', [UploadController::class, 'uploadImages']);

// ==================== Stats & journal d'activité (admin) ====================
Route::middleware('auth.jwt')->get('/stats/dashboard', [StatsController::class, 'dashboard']);
Route::middleware('auth.jwt')->get('/activity-logs', [ActivityLogController::class, 'index']);
