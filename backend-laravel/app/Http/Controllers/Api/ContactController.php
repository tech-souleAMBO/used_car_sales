<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(StoreContactMessageRequest $request)
    {
        $data = $request->validated();

        $message = ContactMessage::create([
            'vehicle_id' => $data['vehicleId'] ?? null,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'message' => $data['message'],
        ]);

        // L'envoi d'e-mail ne doit jamais faire échouer la requête
        try {
            $this->sendNotificationEmail($data);
        } catch (\Throwable $e) {
            Log::warning("Échec de l'envoi de l'e-mail de notification : ".$e->getMessage());
        }

        return response()->json(['message' => 'Votre message a bien été envoyé', 'id' => $message->id], 201);
    }

    public function index()
    {
        $onlyUnread = request()->query('onlyUnread') === 'true';

        $query = ContactMessage::query()->orderByDesc('created_at');
        if ($onlyUnread) {
            $query->where('is_read', false);
        }

        return ContactMessageResource::collection($query->get());
    }

    public function markAsRead(string $id)
    {
        $message = ContactMessage::find($id);
        if (! $message) {
            return response()->json(['statusCode' => 404, 'message' => 'Message introuvable'], 404);
        }

        $message->update(['is_read' => true]);

        return new ContactMessageResource($message);
    }

    private function sendNotificationEmail(array $data): void
    {
        if (! config('mail.mailers.smtp.host')) {
            Log::warning('SMTP non configuré : e-mail de contact non envoyé (voir .env)');

            return;
        }

        $vehicleLabel = '';
        if (! empty($data['vehicleId'])) {
            $vehicle = Vehicle::find($data['vehicleId']);
            if ($vehicle) {
                $vehicleLabel = "{$vehicle->model} ({$vehicle->year})";
            }
        }

        $body = collect([
            "Nom : {$data['name']}",
            "E-mail : {$data['email']}",
            ! empty($data['phone']) ? "Téléphone : {$data['phone']}" : null,
            $vehicleLabel ? "Véhicule concerné : {$vehicleLabel}" : null,
            '',
            $data['message'],
        ])->filter()->implode("\n");

        Mail::raw($body, function ($mail) use ($data, $vehicleLabel) {
            $mail->to(config('mail.from.address'))
                ->replyTo($data['email'])
                ->subject('Nouvelle demande de contact'.($vehicleLabel ? " - {$vehicleLabel}" : ''));
        });
    }
}
