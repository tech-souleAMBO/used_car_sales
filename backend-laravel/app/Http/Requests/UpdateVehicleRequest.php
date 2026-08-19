<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brandId' => ['sometimes', 'uuid', 'exists:brands,id'],
            'model' => ['sometimes', 'string', 'min:1'],
            'version' => ['sometimes', 'nullable', 'string'],
            'year' => ['sometimes', 'integer', 'min:1980', 'max:'.(date('Y') + 1)],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'mileage' => ['sometimes', 'integer', 'min:0'],
            'fuelType' => ['sometimes', Rule::in(['ESSENCE', 'DIESEL', 'ELECTRIQUE', 'HYBRIDE', 'GPL'])],
            'transmission' => ['sometimes', Rule::in(['MANUELLE', 'AUTOMATIQUE'])],
            'bodyType' => ['sometimes', 'nullable', Rule::in(['BERLINE', 'CITADINE', 'SUV', 'BREAK', 'COUPE', 'CABRIOLET', 'MONOSPACE', 'UTILITAIRE'])],
            'doors' => ['sometimes', 'nullable', 'integer'],
            'seats' => ['sometimes', 'nullable', 'integer'],
            'power' => ['sometimes', 'nullable', 'integer'],
            'color' => ['sometimes', 'nullable', 'string'],
            'city' => ['sometimes', 'string'],
            'postalCode' => ['sometimes', 'string'],
            'region' => ['sometimes', 'nullable', 'string'],
            'description' => ['sometimes', 'string', 'min:20'],
            'contactPhone' => ['sometimes', 'nullable', 'string'],
            'contactEmail' => ['sometimes', 'nullable', 'email'],
            'status' => ['sometimes', Rule::in(['AVAILABLE', 'RESERVED', 'SOLD', 'DRAFT'])],
            'isFeatured' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Convertit uniquement les clés présentes (camelCase -> snake_case) pour un update partiel.
     */
    public function toModelAttributes(): array
    {
        $map = [
            'brandId' => 'brand_id',
            'model' => 'model',
            'version' => 'version',
            'year' => 'year',
            'price' => 'price',
            'mileage' => 'mileage',
            'fuelType' => 'fuel_type',
            'transmission' => 'transmission',
            'bodyType' => 'body_type',
            'doors' => 'doors',
            'seats' => 'seats',
            'power' => 'power',
            'color' => 'color',
            'city' => 'city',
            'postalCode' => 'postal_code',
            'region' => 'region',
            'description' => 'description',
            'contactPhone' => 'contact_phone',
            'contactEmail' => 'contact_email',
            'status' => 'status',
            'isFeatured' => 'is_featured',
        ];

        $validated = $this->validated();
        $attributes = [];

        foreach ($map as $camel => $snake) {
            if (array_key_exists($camel, $validated)) {
                $attributes[$snake] = $validated[$camel];
            }
        }

        return $attributes;
    }
}
