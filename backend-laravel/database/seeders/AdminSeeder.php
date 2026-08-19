<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'alexambo197@gmail.com'],
            [
                'password_hash' => Hash::make('alex123!'),
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'role' => Admin::ROLE_SUPERADMIN,
            ]
        );

        $this->command->info('Compte admin créé (alexambo197@gmail.com / alex123!)');
    }
}
