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
            ! empty($data['phone']) ? "Telephone : {$data['phone']}" : null,
            $vehicleLabel ? "Vehicule concerne : {$vehicleLabel}" : null,
            '',
            $data['message'],
        ])->filter()->implode("\n");

        $subject = 'Nouvelle demande de contact'.($vehicleLabel ? " - {$vehicleLabel}" : '');

        try {
            Mail::raw($body, function ($mail) use ($data, $subject) {
                $mail->to(config('mail.from.address'))
                    ->replyTo($data['email'])
                    ->subject($subject);
            });
        } catch (\Throwable $e) {
            Log::warning("Echec envoi email contact: ".$e->getMessage());
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
}
