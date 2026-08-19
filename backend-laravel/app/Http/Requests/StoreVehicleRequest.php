<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brandId' => ['required', 'uuid', 'exists:brands,id'],
            'model' => ['required', 'string', 'min:1'],
            'version' => ['nullable', 'string'],
            'year' => ['required', 'integer', 'min:1980', 'max:'.(date('Y') + 1)],
            'price' => ['required', 'numeric', 'min:0'],
            'mileage' => ['required', 'integer', 'min:0'],
            'fuelType' => ['required', Rule::in(['ESSENCE', 'DIESEL', 'ELECTRIQUE', 'HYBRIDE', 'GPL'])],
            'transmission' => ['required', Rule::in(['MANUELLE', 'AUTOMATIQUE'])],
            'bodyType' => ['nullable', Rule::in(['BERLINE', 'CITADINE', 'SUV', 'BREAK', 'COUPE', 'CABRIOLET', 'MONOSPACE', 'UTILITAIRE'])],
            'doors' => ['nullable', 'integer'],
            'seats' => ['nullable', 'integer'],
            'power' => ['nullable', 'integer'],
            'color' => ['nullable', 'string'],
            'city' => ['required', 'string'],
            'postalCode' => ['required', 'string'],
            'region' => ['nullable', 'string'],
            'description' => ['required', 'string', 'min:20'],
            'contactPhone' => ['nullable', 'string'],
            'contactEmail' => ['nullable', 'email'],
            'status' => ['nullable', Rule::in(['AVAILABLE', 'RESERVED', 'SOLD', 'DRAFT'])],
            'isFeatured' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'description.min' => 'La description doit contenir au moins 20 caractères',
        ];
    }

    /**
     * Convertit les clés camelCase de la requête en snake_case pour Eloquent.
     */
    public function toModelAttributes(): array
    {
        $data = $this->validated();

        return [
            'brand_id' => $data['brandId'],
            'model' => $data['model'],
            'version' => $data['version'] ?? null,
            'year' => $data['year'],
            'price' => $data['price'],
            'mileage' => $data['mileage'],
            'fuel_type' => $data['fuelType'],
            'transmission' => $data['transmission'],
            'body_type' => $data['bodyType'] ?? null,
            'doors' => $data['doors'] ?? null,
            'seats' => $data['seats'] ?? null,
            'power' => $data['power'] ?? null,
            'color' => $data['color'] ?? null,
            'city' => $data['city'],
            'postal_code' => $data['postalCode'],
            'region' => $data['region'] ?? null,
            'description' => $data['description'],
            'contact_phone' => $data['contactPhone'] ?? null,
            'contact_email' => $data['contactEmail'] ?? null,
            'status' => $data['status'] ?? 'DRAFT',
            'is_featured' => $data['isFeatured'] ?? false,
        ];
    }
}
