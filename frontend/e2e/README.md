# Tests end-to-end (Playwright)

Ces tests valident les parcours critiques réels dans un navigateur : recherche, fiche véhicule,
contact, favoris, comparateur, et authentification admin.

## Prérequis

1. Le **backend** doit tourner (`http://localhost:4000` par défaut) avec des données de
   démonstration :
   ```bash
   cd ../backend
   npm run prisma:seed
   npm run start:dev
   ```
2. Installer les navigateurs Playwright (une seule fois) :
   ```bash
   npx playwright install --with-deps chromium
   ```

## Lancer les tests

```bash
npm run test:e2e
```

Le serveur Next.js (`npm run dev`) est démarré automatiquement par Playwright si besoin (voir
`playwright.config.ts`, `webServer`).

## Variables d'environnement optionnelles

| Variable | Rôle | Défaut |
|---|---|---|
| `E2E_BASE_URL` | URL du frontend testé | `http://localhost:3000` |
| `E2E_ADMIN_EMAIL` | Compte admin utilisé pour les tests d'authentification | `admin@example.com` |
| `E2E_ADMIN_PASSWORD` | Mot de passe correspondant | `ChangeMe123!` |

## Fichiers

| Fichier | Couverture |
|---|---|
| `catalog.spec.ts` | Accueil, filtres de recherche, navigation vers une fiche, 404 |
| `contact.spec.ts` | Formulaire de contact e-mail, validation, bouton WhatsApp |
| `favorites-and-comparison.spec.ts` | Ajout/consultation des favoris et du comparateur |
| `admin-auth.spec.ts` | Connexion, protection des routes, persistance de session, déconnexion |

## Note sur l'environnement de ce projet

Ces tests n'ont pas pu être exécutés dans l'environnement de génération de ce code (pas d'accès
réseau pour télécharger les binaires navigateurs Playwright, et pas de backend + base de données
PostgreSQL persistants disponibles). Ils ont été relus attentivement et suivent les bonnes
pratiques Playwright (sélecteurs par rôle/label, attentes explicites), mais **exécutez-les dans
votre environnement** avant de vous y fier pour la CI.
