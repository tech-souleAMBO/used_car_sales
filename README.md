# Vente de voiture d'occasion — Laravel + Next.js

Ce monorepo remplace l'ancien backend NestJS par une **API Laravel 10 (Eloquent + PostgreSQL)**.
Le frontend Next.js est **inchangé** : il consomme la nouvelle API Laravel via le même contrat
(mêmes routes `/api/v1/...`, mêmes réponses JSON camelCase, même authentification par cookie
httpOnly).

⚠️ **Voir `backend-laravel/README.md`** pour un point de transparence important : ce backend a
été écrit à la main sans accès à Composer/Packagist dans l'environnement de génération, donc non
testé de bout en bout (juste vérifié syntaxiquement). Testez-le sérieusement avant la prod.

## Structure

```
autoplatform-laravel/
  backend-laravel/    API Laravel (Eloquent + PostgreSQL)
  frontend/           Application Next.js (inchangée)
```

## Démarrage rapide

```bash
# Terminal 1 - backend
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
docker compose up -d              # PostgreSQL
php artisan storage:link
php artisan migrate
php artisan db:seed                # 15 marques, ~300 véhicules, compte admin
php artisan serve --port=8000     # http://localhost:8000/api/v1

# Terminal 2 - frontend
cd frontend
npm install
cp .env.example .env
npm run dev                        # http://localhost:3000
```

Compte admin de démonstration : `admin@example.com` / `ChangeMe123!`

## Nouveauté : ajout de photos par lien externe

Dans le formulaire d'ajout/modification d'un véhicule (`/admin/vehicules/nouveau` et
`/admin/vehicules/{id}`), en plus du bouton d'upload classique, un champ permet de **coller
directement un lien d'image depuis un autre site** — pratique pour réutiliser une photo déjà
hébergée ailleurs sans avoir à la télécharger puis la re-uploader.

## Ce qui n'a pas changé

Toutes les fonctionnalités livrées précédemment restent identiques côté frontend : catalogue,
recherche avancée, favoris, comparateur, contact WhatsApp/e-mail, dashboard admin complet
(véhicules, marques, messages, journal d'activité, statistiques), logo, cookies httpOnly, etc.
Seul le backend a changé de technologie.
