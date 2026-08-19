<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Models\Vehicle;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function __construct(private ActivityLogService $activityLogService) {}

    public function index(Request $request)
    {
        $includeInactive = $request->query('includeInactive') === 'true';

        $query = Brand::query()->withCount([
            'vehicles' => fn ($q) => $q->where('status', Vehicle::STATUS_AVAILABLE),
        ])->orderBy('name');

        if (! $includeInactive) {
            $query->where('is_active', true);
        }

        return BrandResource::collection($query->get());
    }

    public function show(string $id)
    {
        $brand = Brand::find($id);
        if (! $brand) {
            return response()->json(['statusCode' => 404, 'message' => 'Marque introuvable'], 404);
        }

        return new BrandResource($brand);
    }

    public function store(StoreBrandRequest $request)
    {
        $data = $request->validated();

        if (Brand::where('name', $data['name'])->exists()) {
            return response()->json(['statusCode' => 409, 'message' => 'Cette marque existe déjà'], 409);
        }

        $brand = Brand::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'logo_url' => $data['logoUrl'] ?? null,
            'is_active' => $data['isActive'] ?? true,
        ]);

        $admin = $request->attributes->get('admin');
        $this->activityLogService->record($admin->id, $admin->email, 'CREATE', 'Brand', $brand->id, $brand->name);

        return response()->json(new BrandResource($brand), 201);
    }

    public function update(UpdateBrandRequest $request, string $id)
    {
        $brand = Brand::find($id);
        if (! $brand) {
            return response()->json(['statusCode' => 404, 'message' => 'Marque introuvable'], 404);
        }

        $data = $request->validated();
        $attributes = [];
        if (array_key_exists('name', $data)) {
            $attributes['name'] = $data['name'];
            $attributes['slug'] = Str::slug($data['name']);
        }
        if (array_key_exists('logoUrl', $data)) {
            $attributes['logo_url'] = $data['logoUrl'];
        }
        if (array_key_exists('isActive', $data)) {
            $attributes['is_active'] = $data['isActive'];
        }

        $brand->update($attributes);

        $admin = $request->attributes->get('admin');
        $this->activityLogService->record($admin->id, $admin->email, 'UPDATE', 'Brand', $brand->id, $brand->name);

        return new BrandResource($brand);
    }

    public function destroy(Request $request, string $id)
    {
        $brand = Brand::find($id);
        if (! $brand) {
            return response()->json(['statusCode' => 404, 'message' => 'Marque introuvable'], 404);
        }

        $vehicleCount = Vehicle::where('brand_id', $id)->count();
        if ($vehicleCount > 0) {
            return response()->json([
                'statusCode' => 409,
                'message' => "Impossible de supprimer : {$vehicleCount} véhicule(s) rattaché(s) à cette marque",
            ], 409);
        }

        $name = $brand->name;
        $brand->delete();

        $admin = $request->attributes->get('admin');
        $this->activityLogService->record($admin->id, $admin->email, 'DELETE', 'Brand', $id, $name);

        return response()->json(['message' => 'Marque supprimée avec succès']);
    }
}
