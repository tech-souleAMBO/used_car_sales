<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StorageService;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    private const MAX_FILE_SIZE_KB = 15 * 1024; // 15 Mo

    public function __construct(private StorageService $storageService) {}

    public function uploadImages(Request $request)
    {
        $request->validate([
            'files' => ['required', 'array', 'min:1', 'max:10'],
            'files.*' => ['required', 'file', 'mimes:jpeg,jpg,png,webp', 'max:'.self::MAX_FILE_SIZE_KB],
        ], [
            'files.*.max' => 'Le fichier ne doit pas dépasser 15 Mo.',
            'files.*.mimes' => 'Le fichier doit être une image (jpeg, png, webp).',
        ]);

        $urls = $this->storageService->uploadFiles($request->file('files'));

        return response()->json(['urls' => $urls]);
    }
}
