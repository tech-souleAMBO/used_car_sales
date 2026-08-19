<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasUuid;

    public $timestamps = false;

    public const ACTION_CREATE = 'CREATE';
    public const ACTION_UPDATE = 'UPDATE';
    public const ACTION_DELETE = 'DELETE';

    protected $fillable = [
        'admin_id', 'admin_email', 'action', 'entity_type', 'entity_id', 'summary',
    ];
}
