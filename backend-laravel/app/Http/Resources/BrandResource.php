<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'logoUrl' => $this->logo_url,
            'isActive' => $this->is_active,
            // Présent uniquement quand la relation a été chargée avec withCount('vehicles')
            '_count' => $this->when(
                $this->vehicles_count !== null,
                fn () => ['vehicles' => $this->vehicles_count]
            ),
        ];
    }
}
