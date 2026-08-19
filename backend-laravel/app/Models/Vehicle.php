<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasUuid;

    public const STATUS_AVAILABLE = 'AVAILABLE';
    public const STATUS_RESERVED = 'RESERVED';
    public const STATUS_SOLD = 'SOLD';
    public const STATUS_DRAFT = 'DRAFT';

    protected $fillable = [
        'slug', 'brand_id', 'model', 'version', 'year', 'price', 'mileage',
        'fuel_type', 'transmission', 'body_type', 'doors', 'seats', 'power', 'color',
        'city', 'postal_code', 'region', 'description',
        'contact_phone', 'contact_email', 'status', 'is_featured', 'views_count',
    ];

    protected $casts = [
        'year' => 'integer',
        'price' => 'decimal:2',
        'mileage' => 'integer',
        'doors' => 'integer',
        'seats' => 'integer',
        'power' => 'integer',
        'is_featured' => 'boolean',
        'views_count' => 'integer',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(VehicleImage::class)->orderBy('order');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function comparisonItems(): HasMany
    {
        return $this->hasMany(ComparisonItem::class);
    }
}
