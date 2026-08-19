<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'brandId' => $this->brand_id,
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'model' => $this->model,
            'version' => $this->version,
            'year' => $this->year,
            'price' => (string) $this->price, // cohérent avec l'ancien Decimal Prisma sérialisé en string
            'mileage' => $this->mileage,
            'fuelType' => $this->fuel_type,
            'transmission' => $this->transmission,
            'bodyType' => $this->body_type,
            'doors' => $this->doors,
            'seats' => $this->seats,
            'power' => $this->power,
            'color' => $this->color,
            'city' => $this->city,
            'postalCode' => $this->postal_code,
            'region' => $this->region,
            'description' => $this->description,
            'contactPhone' => $this->contact_phone,
            'contactEmail' => $this->contact_email,
            'status' => $this->status,
            'isFeatured' => $this->is_featured,
            'viewsCount' => $this->views_count,
            'images' => VehicleImageResource::collection($this->whenLoaded('images')),
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
