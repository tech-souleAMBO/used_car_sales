<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use App\Models\VehicleImage;
use App\Services\ActivityLogService;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VehicleController extends Controller
{
    public function __construct(
        private StorageService $storageService,
        private ActivityLogService $activityLogService,
    ) {}

    /** GET /vehicles - catalogue public (ne montre que AVAILABLE sauf statut explicite) */
    public function index(Request $request)
    {
        return $this->search($request, restrictToAvailable: true);
    }

    /** GET /vehicles/admin/search - recherche admin, tous statuts par défaut */
    public function adminSearch(Request $request)
    {
        return $this->search($request, restrictToAvailable: false);
    }

    private function search(Request $request, bool $restrictToAvailable)
    {
        $query = Vehicle::query()->with(['brand', 'images' => fn ($q) => $q->orderBy('order')]);

        $status = $request->query('status') ?: ($restrictToAvailable ? Vehicle::STATUS_AVAILABLE : null);
        if ($status) {
            $query->where('status', $status);
        }

        if ($brandId = $request->query('brandId')) {
            $query->where('brand_id', $brandId);
        }
        if ($model = $request->query('model')) {
            $query->where('model', 'ilike', "%{$model}%");
        }
        if ($city = $request->query('city')) {
            $query->where('city', 'ilike', "%{$city}%");
        }
        if ($request->filled('minPrice')) {
            $query->where('price', '>=', $request->query('minPrice'));
        }
        if ($request->filled('maxPrice')) {
            $query->where('price', '<=', $request->query('maxPrice'));
        }
        if ($request->filled('minYear')) {
            $query->where('year', '>=', $request->query('minYear'));
        }
        if ($request->filled('maxYear')) {
            $query->where('year', '<=', $request->query('maxYear'));
        }
        if ($request->filled('maxMileage')) {
            $query->where('mileage', '<=', $request->query('maxMileage'));
        }
        if ($fuelType = $request->query('fuelType')) {
            $query->where('fuel_type', $fuelType);
        }
        if ($transmission = $request->query('transmission')) {
            $query->where('transmission', $transmission);
        }
        if ($bodyType = $request->query('bodyType')) {
            $query->where('body_type', $bodyType);
        }
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('model', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%")
                    ->orWhere('version', 'ilike', "%{$search}%");
            });
        }

        match ($request->query('sortBy', 'recent')) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'year_asc' => $query->orderBy('year', 'asc'),
            'year_desc' => $query->orderBy('year', 'desc'),
            'mileage_asc' => $query->orderBy('mileage', 'asc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $page = (int) $request->query('page', 1);
        $limit = min((int) $request->query('limit', 20), 100);

        $total = $query->count();
        $items = $query->skip(($page - 1) * $limit)->take($limit)->get();

        return response()->json([
            'items' => VehicleResource::collection($items),
            'meta' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => (int) ceil($total / max($limit, 1)),
            ],
        ]);
    }

    /** GET /vehicles/{slug} - fiche publique (incrémente le compteur de vues) */
    public function showBySlug(string $slug)
    {
        $vehicle = Vehicle::with(['brand', 'images'])->where('slug', $slug)->first();

        if (! $vehicle) {
            return response()->json(['statusCode' => 404, 'message' => 'Véhicule introuvable'], 404);
        }

        $vehicle->increment('views_count');

        return new VehicleResource($vehicle);
    }

    /** GET /vehicles/admin/by-id/{id} - accès admin, tous statuts */
    public function showById(string $id)
    {
        $vehicle = Vehicle::with(['brand', 'images'])->find($id);

        if (! $vehicle) {
            return response()->json(['statusCode' => 404, 'message' => 'Véhicule introuvable'], 404);
        }

        return new VehicleResource($vehicle);
    }

    public function store(StoreVehicleRequest $request)
    {
        $attributes = $request->toModelAttributes();
        $attributes['slug'] = $this->generateUniqueSlug($attributes['model'], $attributes['year']);

        $vehicle = Vehicle::create($attributes);
        $vehicle->load('brand', 'images');

        $admin = $request->attributes->get('admin');
        $this->activityLogService->record(
            $admin->id,
            $admin->email,
            'CREATE',
            'Vehicle',
            $vehicle->id,
            "{$vehicle->brand->name} {$vehicle->model} ({$vehicle->year}) — {$vehicle->city}",
        );

        return response()->json(new VehicleResource($vehicle), 201);
    }

    public function update(UpdateVehicleRequest $request, string $id)
    {
        $vehicle = Vehicle::with('brand')->find($id);
        if (! $vehicle) {
            return response()->json(['statusCode' => 404, 'message' => 'Véhicule introuvable'], 404);
        }

        $vehicle->update($request->toModelAttributes());
        $vehicle->load('brand', 'images');

        $admin = $request->attributes->get('admin');
        $this->activityLogService->record(
            $admin->id,
            $admin->email,
            'UPDATE',
            'Vehicle',
            $vehicle->id,
            "{$vehicle->brand->name} {$vehicle->model} ({$vehicle->year}) — {$vehicle->city}",
        );

        return new VehicleResource($vehicle);
    }

    public function destroy(Request $request, string $id)
    {
        $vehicle = Vehicle::with('brand', 'images')->find($id);
        if (! $vehicle) {
            return response()->json(['statusCode' => 404, 'message' => 'Véhicule introuvable'], 404);
        }

        foreach ($vehicle->images as $image) {
            $this->storageService->deleteFile($image->url);
        }

        $summary = "{$vehicle->brand->name} {$vehicle->model} ({$vehicle->year}) — {$vehicle->city}";
        $vehicle->delete();

        $admin = $request->attributes->get('admin');
        $this->activityLogService->record($admin->id, $admin->email, 'DELETE', 'Vehicle', $id, $summary);

        return response()->json(['message' => 'Véhicule supprimé avec succès']);
    }

    /**
     * POST /vehicles/{id}/images - attache une liste d'URLs au véhicule.
     * Ces URLs peuvent provenir de l'upload interne (voir UploadController) OU être
     * collées directement par l'admin depuis un autre site (lien d'image externe).
     */
    public function addImages(Request $request, string $id)
    {
        $vehicle = Vehicle::find($id);
        if (! $vehicle) {
            return response()->json(['statusCode' => 404, 'message' => 'Véhicule introuvable'], 404);
        }

        $validated = $request->validate([
            'urls' => ['required', 'array', 'min:1'],
            'urls.*' => ['required', 'string'],
        ]);

        $existingCount = $vehicle->images()->count();

        foreach ($validated['urls'] as $index => $url) {
            VehicleImage::create([
                'vehicle_id' => $vehicle->id,
                'url' => $url,
                'order' => $existingCount + $index,
            ]);
        }

        $vehicle->load('brand', 'images');

        return new VehicleResource($vehicle);
    }

    public function removeImage(string $id, string $imageId)
    {
        $image = VehicleImage::where('vehicle_id', $id)->find($imageId);
        if ($image) {
            $this->storageService->deleteFile($image->url);
            $image->delete();
        }

        $vehicle = Vehicle::with('brand', 'images')->find($id);
        if (! $vehicle) {
            return response()->json(['statusCode' => 404, 'message' => 'Véhicule introuvable'], 404);
        }

        return new VehicleResource($vehicle);
    }

    private function generateUniqueSlug(string $model, int $year): string
    {
        $base = Str::slug("{$model}-{$year}");
        $slug = $base;
        $counter = 1;

        while (Vehicle::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
