<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FavoriteResource;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(string $sessionId)
    {
        $favorites = Favorite::with(['vehicle.brand', 'vehicle.images'])
            ->where('session_id', $sessionId)
            ->orderByDesc('created_at')
            ->get();

        return FavoriteResource::collection($favorites);
    }

    public function checkIds(string $sessionId)
    {
        $ids = Favorite::where('session_id', $sessionId)
            ->pluck('vehicle_id')
            ->toArray();

        return response()->json(['ids' => $ids]);
    }

    public function toggle(Request $request)
    {
        $data = $request->validate([
            'sessionId' => ['required', 'string'],
            'vehicleId' => ['required', 'uuid'],
        ]);

        $existing = Favorite::where('session_id', $data['sessionId'])
            ->where('vehicle_id', $data['vehicleId'])
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['favorited' => false]);
        }

        Favorite::create(['session_id' => $data['sessionId'], 'vehicle_id' => $data['vehicleId']]);

        return response()->json(['favorited' => true]);
    }
}
