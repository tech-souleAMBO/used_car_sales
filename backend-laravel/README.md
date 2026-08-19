# Backend Laravel — Plateforme de vente de véhicules d'occasion

API REST construite avec **Laravel 10** (Eloquent + **PostgreSQL**), conçue pour être un
**remplacement direct** de l'ancienne API NestJS : mêmes routes, mêmes formes de réponses JSON
(camelCase), même contrat d'authentification (access token + cookie httpOnly pour le refresh
token). **Le frontend Next.js n'a besoin d'aucune modification** — changez juste
`NEXT_PUBLIC_API_URL` pour pointer vers cette nouvelle API.

## ⚠️ Point de transparence important

Ce projet a été écrit entièrement à la main dans un environnement sans accès à Packagist
(le dépôt de paquets PHP/Composer) : je n'ai donc pas pu exécuter `composer install`,
`php artisan migrate`, `php artisan serve` ni lancer de véritables requêtes HTTP pour le tester
de bout en bout. Chaque fichier a été vérifié individuellement avec `php -l` (contrôle de syntaxe
uniquement) et relu attentivement, mais **testez-le sérieusement chez vous** avant toute mise en
production, et n'hésitez pas à revenir vers moi si une erreur apparaît au démarrage — elle sera
probablement rapide à corriger.

## Démarrage rapide

```bash
# 1. Installer les dépendances PHP
composer install

# 2. Copier le fichier d'environnement et générer la clé d'application
cp .env.example .env
php artisan key:generate

# 3. Adapter .env (base de données, secrets JWT, SMTP...)
#    Générer des secrets robustes :
openssl rand -hex 32   # -> JWT_ACCESS_SECRET
openssl rand -hex 32   # -> JWT_REFRESH_SECRET

# 4. Démarrer PostgreSQL (ex: via le docker-compose du projet)
docker compose up -d

# 5. Lier le stockage public (pour servir les images uploadées en local)
php artisan storage:link

# 6. Appliquer les migrations
php artisan migrate

# 7. Générer les données de démonstration (15 marques, ~300 véhicules, compte admin)
php artisan db:seed

# 8. Lancer le serveur de développement
php artisan serve --port=8000
```

L'API est alors disponible sur `http://localhost:8000/api/v1`.

Compte admin de démonstration créé par le seeder :
- **email** : `admin@example.com`
- **mot de passe** : `ChangeMe123!`

## Structure

| Dossier | Rôle |
|---|---|
| `app/Http/Controllers/Api` | Contrôleurs REST (Auth, Vehicle, Brand, Favorite, Comparison, Contact, Upload, Stats, ActivityLog) |
| `app/Http/Requests` | Validation des entrées (équivalent des DTOs NestJS) |
| `app/Http/Resources` | Mise en forme JSON camelCase (équivalent des classes de sérialisation) |
| `app/Http/Middleware` | `JwtAuthenticate` (vérifie le Bearer token), `EnsureRole` (ADMIN/SUPERADMIN) |
| `app/Models` | Modèles Eloquent, clés primaires en UUID (`HasUuid`) |
| `app/Services` | `JwtService` (génération/vérification des tokens), `StorageService` (upload S3/local), `ActivityLogService` |
| `database/migrations` | Schéma PostgreSQL (8 tables) |
| `database/seeders` | Données de démonstration |
| `routes/api.php` | Toutes les routes, préfixées `/api/v1` |

## Authentification

Strictement identique au contrat de l'ancienne API NestJS :
- `POST /auth/login` → `{ accessToken, admin }` + cookie `httpOnly` `refresh_token` (scope `/api/v1/auth`)
- `POST /auth/refresh` → lit le cookie, renvoie un nouvel `{ accessToken }` + nouveau cookie (rotation)
- `POST /auth/logout` → invalide le refresh token en base, efface le cookie

## Fonctionnalité ajoutée : images par lien externe

`POST /vehicles/{id}/images` accepte un tableau `urls` — ces URLs peuvent provenir de l'upload
interne (`POST /upload/images`, qui héberge le fichier sur S3 ou en local) **ou être n'importe
quel lien d'image externe collé par l'admin** (ex: une photo depuis un autre site). Aucune
différence de traitement côté backend : c'est le frontend qui expose un champ pour coller un lien
en plus du bouton d'upload classique.

## Stockage des images

Bascule automatique vers S3-compatible dès que `S3_ENDPOINT` et `S3_BUCKET` sont renseignés dans
`.env` (voir `StorageService`), sinon utilise le disque local Laravel (`storage/app/public`,
servi via `php artisan storage:link`).

## Sécurité

- Rate limiting global : 100 req/min/IP (`RouteServiceProvider`)
- CORS restreint à `FRONTEND_URL` avec `supports_credentials = true`
- Validation stricte de toutes les entrées (Form Requests)
- Mots de passe hachés avec bcrypt, refresh tokens hachés en base avant stockage
- Toutes les valeurs d'environnement sensibles (secrets JWT, SMTP, S3) sont lues via `config()`
  et jamais via `env()` directement dans le code applicatif, pour rester compatibles avec
  `php artisan config:cache` en production
