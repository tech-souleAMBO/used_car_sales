<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Log;

class ActivityLogService
{
    /**
     * Enregistre une action admin. "Fire and forget" : un échec d'écriture du journal ne
     * doit jamais faire échouer l'action métier elle-même.
     */
    public function record(string $adminId, string $adminEmail, string $action, string $entityType, ?string $entityId, string $summary): void
    {
        try {
            ActivityLog::create([
                'admin_id' => $adminId,
                'admin_email' => $adminEmail,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'summary' => $summary,
            ]);
        } catch (\Throwable $e) {
            Log::warning("Échec de l'écriture du journal d'activité : ".$e->getMessage());
        }
    }

    public function paginate(int $page = 1, int $limit = 20): array
    {
        $query = ActivityLog::orderByDesc('created_at');
        $total = $query->count();
        $items = $query->skip(($page - 1) * $limit)->take($limit)->get();

        return [
            'items' => $items,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => (int) ceil($total / max($limit, 1)),
            ],
        ];
    }
}
