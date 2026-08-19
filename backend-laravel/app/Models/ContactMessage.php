<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $fillable = ['vehicle_id', 'name', 'email', 'phone', 'message', 'is_read'];

    protected $casts = [
        'is_read' => 'boolean',
    ];
}
