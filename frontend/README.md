# Frontend – Plateforme de vente de véhicules d'occasion

Application **Next.js 14** (App Router) consommant l'API NestJS fournie séparément.

## Démarrage rapide

```bash
npm install
cp .env.example .env
# Adapter NEXT_PUBLIC_API_URL si le backend ne tourne pas sur localhost:4000
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

⚠️ **Prérequis réseau** : `npm run build` télécharge les polices (Space Grotesk, Inter, IBM Plex
Mono) depuis Google Fonts via `next/font/google`. Une connexion internet standard est nécessaire
au moment du build (ce qui est le cas de la quasi-totalité des environnements de déploiement).

## Identité visuelle

| Rôle | Choix |
|---|---|
| Fond | `#F6F5F2` (paper) |
| Texte / header / footer | `#14181F` (ink) |
| Accent | `#E2711D` (orange "feu de route") |
| Police d'affichage | Space Grotesk |
| Police de texte | Inter |
| Police de données (prix, km, année) | IBM Plex Mono, chiffres tabulaires |

Le signe distinctif de l'interface : les caractéristiques chiffrées (prix, kilométrage, année)
sont toujours affichées en police mono à chasse fixe façon compteur/tableau de bord — cohérent
avec le sujet automobile.

## Structure

```
src/
  app/
    page.tsx                      Catalogue (accueil) + recherche avancée
    vehicules/[slug]/page.tsx      Fiche véhicule détaillée
    favoris/page.tsx               Favoris (session-based)
    comparateur/page.tsx           Comparateur (jusqu'à 4 véhicules)
    admin/
      page.tsx                    Connexion admin
      layout.tsx                  Shell admin + garde d'authentification
      dashboard/page.tsx          Statistiques
      vehicules/                  Liste, création, édition
      marques/page.tsx            CRUD marques
      journal/page.tsx            Journal d'activité (historique des actions admin)
      messages/page.tsx           Boîte de réception des messages de contact
    sitemap.ts / robots.ts        SEO technique
    mentions-legales, confidentialite  Pages légales / RGPD
  components/                     VehicleCard, SearchFilters, ContactForm, WhatsAppButton...
  lib/
    api.ts                        Client API (fetch + gestion du refresh token)
    auth.ts                       Access token admin en mémoire (le refresh token vit dans un cookie httpOnly)
    session.ts                    Cookie de session anonyme (favoris/comparateur)
    types.ts, format.ts           Types partagés et formatage FR
```

## Fonctionnalités couvertes

- Recherche avancée (marque, ville, prix, année, kilométrage, carburant, transmission, carrosserie, tri, pagination)
- Fiche détaillée avec galerie photo, caractéristiques, description
- Contact WhatsApp (lien `wa.me` pré-rempli) et formulaire e-mail
- Favoris et comparateur (jusqu'à 4 véhicules), basés sur un cookie de session, sans compte utilisateur
- Partage sur les réseaux sociaux (Facebook, WhatsApp, copie de lien)
- Dashboard administrateur complet : CRUD véhicules (avec upload d'images), CRUD marques, statistiques, boîte de réception des messages
- SEO : sitemap dynamique, robots.txt, métadonnées par page
- Responsive mobile / tablette / desktop (Tailwind, mobile-first)

## Tests end-to-end

Voir `e2e/README.md` pour la procédure complète. En résumé :

```bash
npx playwright install --with-deps chromium   # une seule fois
npm run test:e2e
```

Couvre : recherche/filtres du catalogue, fiche véhicule et 404, formulaire de contact, favoris,
comparateur, et authentification admin (connexion, protection des routes, persistance de session
après rechargement, déconnexion).
