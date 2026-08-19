<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasUuid;

    protected $fillable = [
        'email', 'password_hash', 'first_name', 'last_name',
        'role', 'refresh_token_hash', 'is_active',
        'password_reset_token', 'password_reset_expires',
    ];

    protected $hidden = ['password_hash', 'refresh_token_hash', 'password_reset_token'];

    protected $casts = [
        'is_active' => 'boolean',
        'password_reset_expires' => 'datetime',
    ];

    public const ROLE_ADMIN = 'ADMIN';
    public const ROLE_SUPERADMIN = 'SUPERADMIN';
}
