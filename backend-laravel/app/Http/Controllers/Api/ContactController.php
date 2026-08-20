<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\Log;

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

        Log::info('Message de contact sauvegardé', ['id' => $message->id, 'email' => $data['email']]);

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
