<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComparisonItemResource;
use App\Models\ComparisonItem;
use Illuminate\Http\Request;

class ComparisonController extends Controller
{
    private const MAX_ITEMS = 4;

    public function index(string $sessionId)
    {
        $items = ComparisonItem::with(['vehicle.brand', 'vehicle.images'])
            ->where('session_id', $sessionId)
            ->orderBy('created_at')
            ->get();

        return ComparisonItemResource::collection($items);
    }

    public function checkIds(string $sessionId)
    {
        $ids = ComparisonItem::where('session_id', $sessionId)
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

        $existing = ComparisonItem::where('session_id', $data['sessionId'])
            ->where('vehicle_id', $data['vehicleId'])
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['inComparison' => false]);
        }

        $count = ComparisonItem::where('session_id', $data['sessionId'])->count();
        if ($count >= self::MAX_ITEMS) {
            return response()->json([
                'statusCode' => 400,
                'message' => 'Vous ne pouvez comparer que '.self::MAX_ITEMS.' véhicules à la fois',
            ], 400);
        }

        ComparisonItem::create(['session_id' => $data['sessionId'], 'vehicle_id' => $data['vehicleId']]);

        return response()->json(['inComparison' => true]);
    }

    public function clear(string $sessionId)
    {
        ComparisonItem::where('session_id', $sessionId)->delete();

        return response()->json(['message' => 'Comparateur vidé']);
    }
}
