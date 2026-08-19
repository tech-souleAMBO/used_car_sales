<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'adminEmail' => $this->admin_email,
            'action' => $this->action,
            'entityType' => $this->entity_type,
            'summary' => $this->summary,
            'createdAt' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
