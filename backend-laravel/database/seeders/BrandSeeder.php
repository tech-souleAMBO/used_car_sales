<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public const BRANDS = [
        'Peugeot', 'Renault', 'Citroën', 'BMW', 'Mercedes-Benz',
        'Audi', 'Volkswagen', 'Toyota', 'Ford', 'Nissan',
        'Dacia', 'Fiat', 'Opel', 'Volvo', 'Skoda',
    ];

    public function run(): void
    {
        foreach (self::BRANDS as $name) {
            Brand::updateOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)]
            );
        }

        $this->command->info(count(self::BRANDS).' marques créées');
    }
}
