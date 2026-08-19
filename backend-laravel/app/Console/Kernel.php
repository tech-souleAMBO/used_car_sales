<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Définit la planification des tâches de l'application.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Exemple futur : purge périodique des anciens messages de contact (RGPD)
        // $schedule->command('contact-messages:purge')->daily();
    }

    /**
     * Enregistre les commandes artisan de l'application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
