<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Vehicle;
use App\Models\VehicleImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VehicleSeeder extends Seeder
{
    private const CITIES = [
        ['city' => 'Paris', 'postal_code' => '75001', 'region' => 'Île-de-France'],
        ['city' => 'Lyon', 'postal_code' => '69001', 'region' => 'Auvergne-Rhône-Alpes'],
        ['city' => 'Marseille', 'postal_code' => '13001', 'region' => "Provence-Alpes-Côte d'Azur"],
        ['city' => 'Toulouse', 'postal_code' => '31000', 'region' => 'Occitanie'],
        ['city' => 'Nantes', 'postal_code' => '44000', 'region' => 'Pays de la Loire'],
        ['city' => 'Strasbourg', 'postal_code' => '67000', 'region' => 'Grand Est'],
        ['city' => 'Bordeaux', 'postal_code' => '33000', 'region' => 'Nouvelle-Aquitaine'],
        ['city' => 'Lille', 'postal_code' => '59000', 'region' => 'Hauts-de-France'],
    ];

    private const FUEL_TYPES = ['ESSENCE', 'DIESEL', 'ELECTRIQUE', 'HYBRIDE', 'GPL'];
    private const TRANSMISSIONS = ['MANUELLE', 'AUTOMATIQUE'];
    private const BODY_TYPES = ['BERLINE', 'CITADINE', 'SUV', 'BREAK', 'COUPE', 'CABRIOLET', 'MONOSPACE', 'UTILITAIRE'];
    private const COLORS = ['Blanc', 'Noir', 'Gris', 'Bleu', 'Rouge'];
    private const DOORS_OPTIONS = [3, 5];
    private const SEATS_OPTIONS = [4, 5, 7];

    private const MODELS_BY_BRAND = [
        'Peugeot' => ['208', '308', '3008', '2008', '5008'],
        'Renault' => ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic'],
        'Citroën' => ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'C3 Aircross'],
        'BMW' => ['Série 1', 'Série 3', 'X1', 'X3', 'Série 5'],
        'Mercedes-Benz' => ['Classe A', 'Classe C', 'GLA', 'GLC', 'Classe E'],
        'Audi' => ['A3', 'A4', 'Q3', 'Q5', 'A1'],
        'Volkswagen' => ['Golf', 'Polo', 'Tiguan', 'Passat', 'T-Roc'],
        'Toyota' => ['Yaris', 'Corolla', 'RAV4', 'C-HR', 'Aygo'],
        'Ford' => ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Ecosport'],
        'Nissan' => ['Micra', 'Qashqai', 'Juke', 'X-Trail', 'Leaf'],
        'Dacia' => ['Sandero', 'Duster', 'Logan', 'Jogger', 'Spring'],
        'Fiat' => ['500', 'Panda', 'Tipo', '500X', 'Punto'],
        'Opel' => ['Corsa', 'Astra', 'Crossland', 'Grandland', 'Mokka'],
        'Volvo' => ['XC40', 'XC60', 'V60', 'S60', 'XC90'],
        'Skoda' => ['Fabia', 'Octavia', 'Kamiq', 'Karoq', 'Superb'],
    ];

    public function run(): void
    {
        $brands = Brand::all();
        $totalVehicles = 0;

        foreach ($brands as $brand) {
            $models = self::MODELS_BY_BRAND[$brand->name] ?? ['Modèle'];

            for ($i = 0; $i < 20; $i++) {
                $model = $models[array_rand($models)];
                $year = random_int(2015, 2024);
                $location = self::CITIES[array_rand(self::CITIES)];
                $slug = Str::slug("{$brand->name}-{$model}-{$year}-{$totalVehicles}");

                $vehicle = Vehicle::create([
                    'slug' => $slug,
                    'brand_id' => $brand->id,
                    'model' => $model,
                    'year' => $year,
                    'price' => random_int(6000, 41000),
                    'mileage' => random_int(5000, 155000),
                    'fuel_type' => self::FUEL_TYPES[array_rand(self::FUEL_TYPES)],
                    'transmission' => self::TRANSMISSIONS[array_rand(self::TRANSMISSIONS)],
                    'body_type' => self::BODY_TYPES[array_rand(self::BODY_TYPES)],
                    'doors' => self::DOORS_OPTIONS[array_rand(self::DOORS_OPTIONS)],
                    'seats' => self::SEATS_OPTIONS[array_rand(self::SEATS_OPTIONS)],
                    'power' => random_int(70, 270),
                    'color' => self::COLORS[array_rand(self::COLORS)],
                    'city' => $location['city'],
                    'postal_code' => $location['postal_code'],
                    'region' => $location['region'],
                    'description' => "{$brand->name} {$model} {$year}, entretien suivi, contrôle technique OK. Véhicule non fumeur, disponible immédiatement.",
                    'contact_phone' => '+33600000000',
                    'contact_email' => 'contact@example.com',
                    'status' => Vehicle::STATUS_AVAILABLE,
                    'is_featured' => random_int(1, 10) === 1,
                ]);

                for ($idx = 0; $idx < 5; $idx++) {
                    VehicleImage::create([
                        'vehicle_id' => $vehicle->id,
                        'url' => "https://picsum.photos/seed/{$slug}-{$idx}/800/600",
                        'order' => $idx,
                    ]);
                }

                $totalVehicles++;
            }
        }

        $this->command->info("{$totalVehicles} véhicules créés avec leurs images");
    }
}
