<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StorageService
{
    /**
     * Bascule automatiquement vers S3 si les variables S3_ENDPOINT + S3_BUCKET sont
     * renseignées, sinon utilise le disque local ('public', servi via /storage).
     */
    private function disk(): string
    {
        return (config('filesystems.disks.s3.endpoint') && config('filesystems.disks.s3.bucket')) ? 's3' : 'public';
    }

    /**
     * Upload une liste de fichiers et retourne leurs URLs publiques.
     *
     * @param  UploadedFile[]  $files
     * @return string[]
     */
    public function uploadFiles(array $files, string $folder = 'vehicles'): array
    {
        $disk = $this->disk();

        return array_map(function (UploadedFile $file) use ($disk, $folder) {
            $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
            $path = Storage::disk($disk)->putFileAs($folder, $file, $filename, 'public');

            return Storage::disk($disk)->url($path);
        }, $files);
    }

    /**
     * Supprime un fichier à partir de son URL publique. Ne fait rien (et ne lève jamais
     * d'exception) si l'URL correspond à un lien externe collé par l'admin plutôt qu'à un
     * fichier réellement hébergé sur notre stockage — dans ce cas il n'y a rien à supprimer.
     */
    public function deleteFile(string $url, string $folder = 'vehicles'): void
    {
        $filename = basename(parse_url($url, PHP_URL_PATH) ?: $url);
        if (! $filename) {
            return;
        }

        $disk = $this->disk();
        $path = $folder.'/'.$filename;

        try {
            if (Storage::disk($disk)->exists($path)) {
                Storage::disk($disk)->delete($path);
            }
        } catch (\Throwable $e) {
            Log::warning("Échec de la suppression du fichier {$path} : ".$e->getMessage());
        }
    }
}
