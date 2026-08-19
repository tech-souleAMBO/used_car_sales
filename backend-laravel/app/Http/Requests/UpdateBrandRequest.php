<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'min:1'],
            'logoUrl' => ['sometimes', 'nullable', 'string'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
