<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\ContactMessage;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function dashboard()
    {
        $overview = [
            'totalVehicles' => Vehicle::count(),
            'availableVehicles' => Vehicle::where('status', Vehicle::STATUS_AVAILABLE)->count(),
            'soldVehicles' => Vehicle::where('status', Vehicle::STATUS_SOLD)->count(),
            'draftVehicles' => Vehicle::where('status', Vehicle::STATUS_DRAFT)->count(),
            'totalBrands' => Brand::count(),
            'totalContactMessages' => ContactMessage::count(),
            'unreadContactMessages' => ContactMessage::where('is_read', false)->count(),
        ];

        $mostViewedVehicles = Vehicle::with('brand:id,name')
            ->orderByDesc('views_count')
            ->limit(5)
            ->get(['id', 'model', 'views_count', 'brand_id'])
            ->map(fn ($v) => [
                'id' => $v->id,
                'model' => $v->model,
                'viewsCount' => $v->views_count,
                'brand' => ['name' => $v->brand->name],
            ]);

        $vehiclesByBrand = Vehicle::select('brand_id', DB::raw('count(*) as count'))
            ->groupBy('brand_id')
            ->with('brand:id,name')
            ->get()
            ->map(fn ($row) => ['brand' => $row->brand->name ?? 'Inconnu', 'count' => (int) $row->count]);

        $vehiclesByFuelType = Vehicle::select('fuel_type', DB::raw('count(*) as count'))
            ->groupBy('fuel_type')
            ->get()
            ->map(fn ($row) => ['fuelType' => $row->fuel_type, 'count' => (int) $row->count]);

        return response()->json([
            'overview' => $overview,
            'mostViewedVehicles' => $mostViewedVehicles,
            'vehiclesByBrand' => $vehiclesByBrand,
            'vehiclesByFuelType' => $vehiclesByFuelType,
        ]);
    }
}
