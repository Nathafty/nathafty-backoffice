# Spécifications — Plateforme Nathafty

> Document destiné aux développeurs (Flutter + Next.js) pour la mise en œuvre de la plateforme de gestion de collecte de déchets de **Nathafty**.
>
> _"Moins de déchets, Plus d'avenir"_
>
> **Marché** : Mauritanie (téléphones `+222`, devise MRU — Ouguiya mauritanien).

---

## Table des matières

1. [Vue d'ensemble de la plateforme](#1-vue-densemble-de-la-plateforme)
2. [Stack technique imposée](#2-stack-technique-imposée)
3. [Schéma de base de données (existant + extensions)](#3-schéma-de-base-de-données)
4. [Application mobile Client (Flutter)](#4-application-mobile-client-flutter)
5. [Application mobile Collecteur (Flutter)](#5-application-mobile-collecteur-flutter)
6. [Backoffice Web (Next.js)](#6-backoffice-web-nextjs)
7. [API & contrats backend](#7-api--contrats-backend)
8. [Sécurité — RLS Supabase](#8-sécurité--rls-supabase)
9. [Notifications push](#9-notifications-push)
10. [Tâches planifiées (CRON)](#10-tâches-planifiées-cron)
11. [Livrables et critères d'acceptation](#11-livrables-et-critères-dacceptation)
12. [Planning indicatif](#12-planning-indicatif)

---

## 1. Vue d'ensemble de la plateforme

Nathafty est une entreprise mauritanienne de **gestion de déchets ménagers**. La plateforme se compose de **3 applications** qui partagent une même base de données Supabase (PostgreSQL) :

```
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│   App Client         │    │   App Collecteur     │    │   Backoffice Web     │
│   (Flutter)          │    │   (Flutter)          │    │   (Next.js 15)       │
│                      │    │                      │    │                      │
│  - Calendrier        │    │  - Tournée du jour   │    │  - Dashboard         │
│  - Paiements         │    │  - Itinéraire opti   │    │  - Planification     │
│  - Abonnement        │    │  - Preuve collecte   │    │  - Ménages/Drivers   │
│  - Réclamations      │    │  - Mode offline      │    │  - Paiements/Reports │
│  - Notifications     │    │                      │    │  - Réclamations      │
└──────────┬───────────┘    └──────────┬───────────┘    └──────────┬───────────┘
           │                           │                           │
           └───────────────────────────┴───────────────────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   Supabase          │
                            │  - Postgres + RLS   │
                            │  - Auth (OTP SMS)   │
                            │  - Storage (photos) │
                            │  - Edge Functions   │
                            │  - Realtime         │
                            └─────────────────────┘
```

**Acteurs / rôles** :
- **Client** (chef de ménage abonné) → app mobile Client
- **Collecteur** (chauffeur terrain) → app mobile Collecteur
- **Admin** (équipe Nathafty) → backoffice web
- **Super-admin** → backoffice web (gestion des admins, paramètres globaux)

---

## 2. Stack technique imposée

| Composant | Techno | Justification |
|---|---|---|
| Mobile (client + collecteur) | **Flutter 3.x** + Dart | Une seule codebase, 2 builds via flavors (`client`, `driver`) |
| State management Flutter | Riverpod ou Bloc | Au choix du dev, mais cohérent dans les 2 apps |
| Backoffice | **Next.js 15** (App Router) + TypeScript | Déjà en place dans ce repo |
| UI Web | Tailwind CSS 3 + shadcn/ui | Existant |
| BDD | **Supabase** (PostgreSQL 15) | Existant — fournit aussi Auth + Storage + Realtime |
| Auth | Supabase Auth — OTP SMS (`+222`) | Adapté au contexte mauritanien |
| Push notifications | **Firebase Cloud Messaging** (FCM) | Free tier, supporte Android (cible principale) |
| Cartographie | **Mapbox** (préféré) ou Google Maps | Mapbox = offline-friendly, tarifs plus souples |
| Stockage fichiers | Supabase Storage | Photos preuves de collecte, justificatifs réclamations |
| Hébergement web | Vercel ou VPS | À décider |

---

## 3. Schéma de base de données

### 3.1 Vue d'ensemble — diagramme relationnel

```
                                  ┌──────────────────┐
                                  │  auth.users      │  ← Supabase Auth (managed)
                                  │  (uuid, email,   │
                                  │   phone, ...)    │
                                  └────────┬─────────┘
                                           │
                       ┌───────────────────┼───────────────────┐
                       │                   │                   │
                ┌──────▼─────┐      ┌──────▼─────┐      ┌──────▼─────┐
                │ households │      │  drivers   │      │ user_roles │  ← NOUVEAU
                │            │      │            │      │ (admin,    │
                │ client     │      │ collecteur │      │  client,   │
                └──┬───────┬─┘      └─────┬──────┘      │  driver)   │
                   │       │              │              └────────────┘
                   │       │              │
        ┌──────────┘       │              │
        │                  │              │
┌───────▼────────┐  ┌──────▼──────┐  ┌────▼──────────┐
│ subscriptions  │  │  payments   │  │  collections  │
│ (NOUVEAU)      │  │             │  │  (planning)   │
│ - plan_id      │  │ - amount    │  │  - driver_id  │
│ - start/end    │  │ - due_date  │  │  - date       │
└───────┬────────┘  │ - status    │  │  - status     │
        │           └─────────────┘  └───────┬───────┘
        │                                    │
┌───────▼────────────┐                       │
│ subscription_plans │                ┌──────▼───────────┐
│ (NOUVEAU)          │                │ houses_to_collect│  ← join household ↔ collection
│ - price_mru        │                │  - status        │
│ - duration_days    │                │  - proof_photo   │ ← NOUVEAU
└────────────────────┘                │  - proof_gps     │ ← NOUVEAU
                                      │  - completed_at  │ ← NOUVEAU
                                      └──────────────────┘

┌─────────────┐         ┌──────────────────────┐
│ complaints  │◄────────│ complaint_attachments│  ← NOUVEAU
│             │         │  (photos)            │
└─────────────┘         └──────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  districts   │      │  vehicles    │      │   routes     │
│              │      │              │      │  (templates) │
└──────────────┘      └──────────────┘      └──────────────┘

┌────────────────┐     ┌──────────────────┐    ┌─────────────────────┐
│ notifications  │◄────│  device_tokens   │    │ household_surveys   │
│  (NOUVEAU)     │     │   (NOUVEAU FCM)  │    │  (prospection — déjà │
└────────────────┘     └──────────────────┘    │   en place)         │
                                               └─────────────────────┘

┌──────────────────────┐
│ renewal_requests     │  ← NOUVEAU (demandes de renouvellement client)
└──────────────────────┘
```

### 3.2 Tables existantes — description détaillée

#### `households` — Ménages abonnés (= comptes clients)

| Colonne | Type | Description |
|---|---|---|
| `id` | varchar (PK) | Identifiant interne (ex: `HH-2025-0042`) |
| `user_id` | uuid (FK → `auth.users.id`, UNIQUE) | Lien avec compte Supabase Auth |
| `name` | varchar | Nom du chef de ménage |
| `phone` | varchar | Téléphone `+222...` |
| `address` | text | Adresse libre |
| `district_id` | int (FK → `districts.id`) | Quartier / secteur |
| `family_size` | int | Taille du foyer |
| `subscription_type` | varchar | `basic`, `premium`... (legacy — voir `subscriptions`) |
| `status` | enum `house_hold_status` | `PENDING`, `VALID` — validation admin |
| `actif_remaining_days` | int | Jours restants d'abonnement (décrémenté par cron) |
| `registration_date` | date | Date d'inscription |
| `created_at`, `updated_at` | timestamp | |

> ⚠️ **À ajouter** : `latitude`, `longitude`, `address_details` (voir §3.3)

#### `drivers` — Collecteurs

| Colonne | Type | Description |
|---|---|---|
| `id` | int (PK) | |
| `user_id` | uuid (FK → `auth.users.id`, UNIQUE) | Compte Supabase pour login mobile |
| `name` | text | |
| `phone` | text | |
| `nni` | text | Numéro national d'identification |
| `status` | enum `driver_status` | `ACTIVE`, `INACTIVE`, `SUSPENDED` |

#### `collections` — Sessions de collecte planifiées

| Colonne | Type | Description |
|---|---|---|
| `id` | int (PK) | |
| `title` | text | Ex : "Tournée Tevragh Zeina — 12/06" |
| `zone` | text | Zone géographique |
| `scheduled_date` | date | Date prévue |
| `end_date` | date | Date de fin si étalée |
| `driver_id` | int (FK → `drivers.id`) | Collecteur affecté |
| `status` | enum `collection_status` | `SCHEDULED`, `PROGRESS`, `COMPLETE` |

#### `houses_to_collect` — Détail : quel ménage dans quelle collecte

Table de liaison **plusieurs-à-plusieurs** entre `households` et `collections`.

| Colonne | Type | Description |
|---|---|---|
| `id` | int (PK) | |
| `household_id` | text (FK → `households.id`) | |
| `collection_id` | int (FK → `collections.id`) | |
| `status` | text | `pending`, `done`, `skipped` |
| `collection_date` | date | Date effective |

> ⚠️ **À ajouter** : `completed_at`, `proof_photo_url`, `proof_latitude`, `proof_longitude`, `driver_note`, `skip_reason`, `completed_by_driver_id` (voir §3.3)

#### `payments` — Paiements

| Colonne | Type | Description |
|---|---|---|
| `id` | int (PK) | |
| `household_id` | varchar (FK) | |
| `amount` | numeric | En MRU |
| `due_date` | date | Échéance |
| `paid_date` | date | NULL si non payé |
| `status` | varchar | `pending`, `paid`, `overdue` |
| `payment_method` | varchar | `cash`, `bankily`, `masrvi`, `sedad` (mobile money MR) |
| `subscription_type` | varchar | Plan correspondant |

#### `complaints` — Réclamations clients

| Colonne | Type | Description |
|---|---|---|
| `id` | varchar (PK) | UUID ou ID custom |
| `ticket_number` | varchar (UNIQUE) | Ex : `CMP-2025-0001` |
| `household_id` | varchar (FK) | |
| `household_name` | varchar | Dénormalisé |
| `category` | varchar | `missed_collection`, `damage`, `billing`, `other` |
| `priority` | varchar | `low`, `medium`, `high` (défaut `medium`) |
| `status` | varchar | `open`, `in_progress`, `resolved`, `closed` |
| `description` | text | |
| `assigned_to` | varchar | ID admin assigné |
| `response` | text | Réponse Nathafty |
| `submitted_date`, `resolved_date` | date | |
| `driver_id` | int (FK) | Si liée à un collecteur |

#### `districts` — Quartiers/secteurs

| Colonne | Type | Description |
|---|---|---|
| `id` | int (PK) | |
| `name` | varchar (UNIQUE) | Ex : "Tevragh Zeina" |
| `code` | varchar (UNIQUE) | Ex : "TZN" |
| `description` | text | |
| `is_active` | boolean | |

#### `vehicles`, `routes`

Tables utilitaires :
- `vehicles` : `license_plate`, `type` (camion, tricycle...)
- `routes` : **templates** de tournées récurrentes (à distinguer de `collections` qui sont des **instances** planifiées). Lien `routes ↔ collections` à clarifier avec le métier — pour le MVP, `collections` suffit.

#### `household_surveys` — Prospection (déjà en place)

Table de l'application actuelle (questionnaire). Sert à constituer une liste de prospects qu'un admin peut convertir en `households`. **À conserver telle quelle.**

#### `tabletteIdentification` — Legacy

Table héritée d'un autre projet. **Ignorer.**

### 3.3 Évolutions de schéma à appliquer

Les migrations SQL complètes sont fournies dans `docs/migrations/001_platform_extensions.sql`. Résumé :

1. **GPS sur `households`** — indispensable pour l'app collecteur
2. **`subscription_plans`** (catalogue) + **`subscriptions`** (instances par ménage)
3. **`renewal_requests`** — demandes de renouvellement initiées depuis l'app client
4. **`device_tokens`** + **`notifications`** — push FCM
5. **Preuves de collecte** sur `houses_to_collect` (photo, GPS au moment de la collecte)
6. **`complaint_attachments`** — pièces jointes photos
7. **`user_roles`** — rôles applicatifs (`client`, `driver`, `admin`, `super_admin`)

### 3.4 Vues existantes (à utiliser, ne pas dupliquer en code)

- **`view_household_summary`** : ménage + ses collectes passées et futures (JSON agrégé)
- **`view_household_payments`** : ménage + historique de paiements avec totaux

Ces vues sont **idéales pour alimenter les écrans Client** (calendrier, paiements).

---

## 4. Application mobile Client (Flutter)

### 4.1 Persona et parcours

**Persona** : Aïcha, 45 ans, chef de ménage à Nouakchott. Abonnée à Nathafty depuis 3 mois. Utilise WhatsApp et un smartphone Android d'entrée de gamme.

**Parcours type** :
1. Reçoit un SMS d'invitation avec lien d'installation
2. Installe l'app, saisit son numéro `+222...`, reçoit OTP, se connecte
3. Voit son calendrier de collecte, son statut d'abonnement
4. Reçoit une notif "votre poubelle a été collectée" + photo
5. À J-7 de l'expiration : notif "renouvelez votre abonnement" → demande de renouvellement → admin la traite → paiement
6. Si problème : crée une réclamation avec photo

### 4.2 Authentification

- Supabase Auth — **OTP par SMS** (numéro `+222XXXXXXXX`)
- Pas de mot de passe (simplicité d'usage)
- Session persistée localement (refresh token)
- Le `user_id` retourné doit correspondre à un `households.user_id` — sinon écran "Compte non trouvé, contactez Nathafty"

### 4.3 Écrans détaillés

| # | Écran | Données affichées | Actions |
|---|---|---|---|
| 1 | **Splash + Onboarding** | Logo, slogan | → Login |
| 2 | **Login** | Champ tel + OTP | Connexion |
| 3 | **Accueil** | Carte statut abo (jours restants, couleur), prochaine collecte, total dû | Boutons rapides : Renouveler, Réclamer |
| 4 | **Calendrier** | Vue calendaire mensuelle + liste, collectes passées (✓ vert) et futures (📅 bleu) — depuis `view_household_summary` | Tap → détail |
| 5 | **Détail collecte** | Date, statut, photo de preuve si `COMPLETE`, nom collecteur | — |
| 6 | **Mon abonnement** | Plan actuel, date début/fin, jours restants, historique | Bouton "Renouveler" |
| 7 | **Renouvellement** | Liste `subscription_plans` actifs, prix, durée | Confirmer → crée `renewal_requests` (status `pending`) |
| 8 | **Paiements** | Liste depuis `view_household_payments`, filtres payés / en attente / en retard, total dû | Tap → détail paiement |
| 9 | **Réclamations** | Liste de mes tickets avec statut | Bouton "Nouvelle réclamation" |
| 10 | **Nouvelle réclamation** | Catégorie (select), description (text), photo (capture ou galerie) | POST → ticket créé |
| 11 | **Détail réclamation** | Conversation, statut, réponse Nathafty | — |
| 12 | **Notifications** | Liste depuis `notifications`, badge non lus | Tap → marquer lu |
| 13 | **Profil** | Nom, tel, WhatsApp, adresse, position GPS | Modifier (sauf `id`, `user_id`) |
| 14 | **Paramètres** | Langue (FR/AR), thème, déconnexion | |

### 4.4 Fonctionnalités transversales

- **Internationalisation** : Français (défaut) + Arabe (RTL)
- **Mode dégradé réseau** : afficher cache, indicateur "données peut-être obsolètes"
- **Push FCM** : enregistrer le token au login (POST `/api/me/device-token`)
- **Capture GPS** lors de l'inscription / mise à jour du profil → écriture dans `households.latitude/longitude`

---

## 5. Application mobile Collecteur (Flutter)

### 5.1 Persona et parcours

**Persona** : Moussa, 32 ans, collecteur Nathafty. Conduit un tricycle. Smartphone Android partagé avec l'équipe.

**Parcours type** :
1. Le matin : ouvre l'app, voit sa tournée du jour (15 maisons)
2. Tape "Démarrer" → l'itinéraire optimisé s'affiche sur carte
3. Pour chaque maison : navigue (Maps externe), collecte, prend photo, valide
4. Si maison absente : marque "non collectée" + motif
5. Fin de journée : récap auto, synchro si offline

### 5.2 Authentification

- Login email/password (compte créé par admin pour le `drivers.user_id`)
- Vérification du rôle `driver` dans `user_roles`

### 5.3 Écrans détaillés

| # | Écran | Contenu | Logique clé |
|---|---|---|---|
| 1 | **Login** | Email + password | |
| 2 | **Dashboard du jour** | Date, nb maisons, nb faites, bouton "Voir tournée" | Requête : `collections` du jour pour `driver_id` |
| 3 | **Liste tournée** | Liste ordonnée par séquence optimisée (numéro 1, 2, 3...) | Données : `houses_to_collect` joint à `households` |
| 4 | **Carte** | Tous les points, polyline = itinéraire optimisé, position actuelle | Cf §5.4 — appel API d'optimisation |
| 5 | **Détail maison** | Nom, adresse, tel (clic-pour-appeler), GPS (bouton "Naviguer" → Google Maps externe) | Bouton "Marquer collectée" / "Marquer absente" |
| 6 | **Validation collecte** | **Photo obligatoire** (caméra), capture GPS auto, note libre | POST → marque `houses_to_collect.status='done'` + preuve |
| 7 | **Non collectée** | Sélection motif : absent / refus / accès bloqué / autre + note | POST → `status='skipped'`, `skip_reason` |
| 8 | **Historique** | Tournées passées par semaine | |
| 9 | **Notifications** | Réaffectation, message admin | |

### 5.4 Optimisation d'itinéraire — détails techniques

**Algorithme** :
- **MVP (recommandé)** : algo voisin le plus proche (Nearest Neighbor) côté app (latence nulle, fonctionne offline). Suffisant pour ≤50 points.
- **V2 (si volume)** : appel backend `GET /api/driver/route/:collectionId/optimize?lat=X&lng=Y`
  - Le backend appelle **Mapbox Optimization API** ou **OSRM** auto-hébergé
  - Retourne l'ordre optimisé + polyline + distance/durée estimées

**Affichage carte** :
- Mapbox GL Flutter
- Marqueurs numérotés (1, 2, 3...)
- Polyline d'itinéraire
- Position du collecteur en temps réel (GPS toutes 10s pendant tournée active)

### 5.5 Mode offline

- **Cache local** : Isar ou Hive — sauvegarde de la tournée du jour au démarrage
- **File d'attente** : validations (statut + photo) stockées localement si pas de réseau
- **Sync** : background worker qui upload dès retour réseau (WorkManager / workmanager package)
- **Photos** : compressées avant upload (max 1 MB), uploadées dans Supabase Storage bucket `collection-proofs`

### 5.6 Permissions Android requises

- `ACCESS_FINE_LOCATION` (GPS pendant tournée)
- `CAMERA` (preuves photos)
- `CALL_PHONE` (clic-pour-appeler)
- `INTERNET`, `ACCESS_NETWORK_STATE`
- `FOREGROUND_SERVICE` (tournée active en arrière-plan)

---

## 6. Backoffice Web (Next.js)

### 6.1 Authentification & rôles

- Supabase Auth — email + password
- Rôle `admin` ou `super_admin` requis (table `user_roles`)
- RLS Postgres applique le bypass via JWT claim

### 6.2 Modules

#### 6.2.1 Dashboard

KPIs principaux :
- Nombre de ménages actifs / en attente / inactifs
- Taux de collecte du mois (% de `houses_to_collect.status='done'`)
- CA mensuel (somme `payments.amount` où `status='paid'` et `paid_date` dans le mois)
- Abonnements expirant à 7 / 15 / 30 jours
- Réclamations ouvertes par priorité
- Graphique : collectes par jour (30 derniers jours)
- Graphique : CA par mois (12 derniers mois)

#### 6.2.2 Gestion des ménages

- Liste paginée avec recherche (nom, tel, ID), filtres (district, statut, plan)
- Vue détaillée : profil + carte GPS + historique collectes + paiements + réclamations
- **Validation** : `PENDING` → `VALID` (workflow d'onboarding)
- Création manuelle (admin saisit un ménage qui n'a pas l'app)
- Conversion depuis `household_surveys` : un prospect devient un client

#### 6.2.3 Gestion des collecteurs

- CRUD `drivers`
- **Création de compte Supabase Auth** associé (email/password généré ou défini)
- Activation / suspension
- Statistiques par collecteur : collectes réalisées, taux de réussite

#### 6.2.4 Véhicules & Districts

- CRUD simples

#### 6.2.5 Planification de collecte (cœur métier)

- **Vue calendrier** des `collections` planifiées
- Création d'une collecte :
  1. Sélection date + zone + collecteur + véhicule
  2. Sélection des ménages à inclure (filtre par district, par abonnement actif)
  3. Génération automatique de `houses_to_collect`
  4. Pré-calcul de l'itinéraire optimisé (sauvegardé pour le collecteur)
- Modification, annulation
- Templates récurrents (utiliser `routes` pour les tournées hebdo standardisées)

#### 6.2.6 Suivi temps réel

- Carte de toutes les tournées **en cours** (`status='PROGRESS'`)
- Position GPS des collecteurs (via Supabase Realtime)
- % d'avancement par tournée
- Notification admin si un collecteur n'a pas démarré 1h après l'heure prévue

#### 6.2.7 Paiements

- Liste avec filtres (statut, période, méthode)
- Saisie manuelle (paiement cash, mobile money — Bankily, Masrvi, Sedad)
- Validation des paiements (déclenche extension de `subscriptions.end_date`)
- Génération automatique des `payments` à venir (job cron)
- Export CSV / PDF

#### 6.2.8 Abonnements & renouvellements

- Gestion catalogue `subscription_plans` (prix, durée)
- File des `renewal_requests` à traiter
- Validation manuelle (admin enregistre le paiement → status `paid` → crée nouveau `subscriptions`)

#### 6.2.9 Réclamations

- File de tickets, tri par priorité
- Assignation à un admin
- Réponse (déclenche notification client)
- Changement de statut

#### 6.2.10 Enquêtes (existant)

Garde l'app actuelle de prospection (`SurveyForm`, `ResultsChart`). Permet à un admin de consulter les réponses.

#### 6.2.11 Notifications

- Envoi manuel ciblé : par district, par segment (abos expirant, en retard de paiement...)
- Templates personnalisables
- Historique des envois

#### 6.2.12 Rapports

- Export CSV : collectes du mois, ménages inactifs, CA
- PDF mensuel automatisé

### 6.3 UX/UI

- Suivre la charte actuelle (Tailwind + composants existants)
- Layout : sidebar + topbar
- Tableaux paginés (TanStack Table)
- Graphiques (Recharts, déjà en place)
- Cartes (React-Leaflet ou Mapbox GL JS)

---

## 7. API & contrats backend

> Les endpoints peuvent être implémentés via **Next.js API Routes** (`app/api/...`) OU **Supabase Edge Functions** (Deno). Recommandation : API Routes pour rester cohérent avec le repo existant.

### 7.1 App Client

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/me/household` | Profil du ménage connecté |
| PATCH | `/api/me/household` | Mise à jour profil (nom, adresse, GPS, whatsapp) |
| GET | `/api/me/collections?from=&to=` | Calendrier collectes |
| GET | `/api/me/subscription` | Abonnement courant + historique |
| POST | `/api/me/renewal-request` | `{ plan_id }` → crée demande |
| GET | `/api/me/payments` | Historique paiements |
| GET | `/api/me/complaints` | Mes tickets |
| POST | `/api/me/complaints` | `{ category, description, photo_url? }` |
| POST | `/api/me/device-token` | `{ token, platform }` |
| GET | `/api/me/notifications?unread=true` | |
| PATCH | `/api/me/notifications/:id/read` | |

### 7.2 App Collecteur

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/driver/today` | Tournée du jour |
| GET | `/api/driver/collections/:id` | Détail tournée |
| GET | `/api/driver/route/:collectionId/optimize?lat=&lng=` | Itinéraire optimisé |
| POST | `/api/driver/houses/:id/complete` | `{ photo_url, lat, lng, note? }` |
| POST | `/api/driver/houses/:id/skip` | `{ reason, note? }` |
| GET | `/api/driver/history?from=&to=` | Historique |

### 7.3 Backoffice — utiliser directement Supabase client (RLS protège) pour les CRUD. Endpoints custom uniquement pour :

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/drivers` | Crée driver + compte Supabase Auth |
| POST | `/api/admin/collections/:id/optimize-route` | Précalcul itinéraire |
| POST | `/api/admin/notifications/broadcast` | Envoi groupé FCM |
| GET | `/api/admin/reports/monthly?month=` | Export PDF |

### 7.4 Conventions

- **Auth** : header `Authorization: Bearer <supabase_jwt>` — vérifié via `supabase.auth.getUser(token)`
- **Format réponses** : JSON, `{ data, error }`
- **Codes HTTP** : 200, 201, 400, 401, 403, 404, 500
- **Validation** : Zod côté serveur, dénoncer 400 si payload invalide

---

## 8. Sécurité — RLS Supabase

**RLS doit être activé sur toutes les tables `public.*`.**

Exemples de politiques :

```sql
-- households : client lit son propre ménage
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client reads own household"
  ON households FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "client updates own household"
  ON households FOR UPDATE
  USING (auth.uid() = user_id);

-- collections : driver voit ses propres collectes
CREATE POLICY "driver reads own collections"
  ON collections FOR SELECT
  USING (
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  );

-- houses_to_collect : driver lit + update les siennes
CREATE POLICY "driver manages own houses"
  ON houses_to_collect FOR ALL
  USING (
    collection_id IN (
      SELECT id FROM collections
      WHERE driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    )
  );

-- Admin : bypass via rôle
CREATE POLICY "admin all access on households"
  ON households FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

> Le fichier `docs/migrations/002_rls_policies.sql` fournit toutes les politiques.

**Service role key** : utilisée UNIQUEMENT côté serveur Next.js (API Routes) pour les opérations nécessitant le bypass. Jamais exposée au client.

---

## 9. Notifications push

### 9.1 Architecture

```
Évènement métier ──> trigger Postgres ──> Edge Function `send-notification`
                                            │
                                            ├──> insert notifications
                                            └──> FCM HTTP API (envoi push)
```

### 9.2 Types de notifications

| Type | Déclencheur | Destinataire |
|---|---|---|
| `collection_done` | `houses_to_collect.status='done'` | Client (`households.user_id`) |
| `collection_reminder` | CRON quotidien à 18h pour collectes J+1 | Client |
| `payment_due_soon` | CRON quotidien : `subscriptions.end_date - 7 jours` | Client |
| `subscription_expired` | CRON quotidien | Client |
| `renewal_approved` | Action admin | Client |
| `complaint_update` | Update `complaints.response` ou `status` | Client |
| `route_assigned` | Création `collections` ou réaffectation | Driver |
| `complaint_assigned` | `complaints.assigned_to` set | Admin |

### 9.3 Implémentation FCM

- Côté Flutter : `firebase_messaging`
- Token enregistré dans `device_tokens` au login (+ refresh)
- Côté backend : utiliser **FCM HTTP v1 API** (clé de service Firebase Admin SDK)

---

## 10. Tâches planifiées (CRON)

À implémenter via **Supabase Scheduled Functions** (pg_cron) ou un service externe (cron-job.org appelant un endpoint admin sécurisé).

| Fréquence | Tâche |
|---|---|
| Quotidien 00:05 | Décrémenter `households.actif_remaining_days`, marquer expirés |
| Quotidien 08:00 | Détecter abos expirant à J+7 → notif `payment_due_soon` |
| Quotidien 18:00 | Notif `collection_reminder` pour collectes J+1 |
| Quotidien 23:00 | Générer `payments` à échéance pour le mois suivant |
| Hebdomadaire (lundi) | Rapport hebdo email aux admins |
| Mensuel (1er) | Export rapport PDF mensuel |

---

## 11. Livrables et critères d'acceptation

### 11.1 Mobile (Flutter)

- ✅ Code source dans repo Git (1 repo, 2 flavors `client` + `driver`)
- ✅ `README.md` : prérequis, setup, build, déploiement
- ✅ Fichier `.env.example` avec toutes les clés requises (Supabase URL/anon key, Mapbox token, Firebase config)
- ✅ APK signés pour chaque flavor (alpha → release)
- ✅ Tests d'intégration sur **3 appareils Android** (Android 10+, gamme entrée + milieu)
- ✅ iOS : optionnel (à valider avec Nathafty)
- ✅ Documentation des écrans dans le README ou Storybook

### 11.2 Web (Next.js)

- ✅ Étendre **ce repo** (`nathafty-customer-survey`)
- ✅ Tous les modules listés en §6.2
- ✅ Dockerfile + instructions de déploiement
- ✅ Tests E2E sur les workflows critiques (création collecte, validation paiement, traitement réclamation)
- ✅ Documentation des Edge Functions / API Routes (OpenAPI ou Markdown)

### 11.3 Base de données

- ✅ Toutes les migrations dans `supabase/migrations/` (timestamps, versionnées)
- ✅ Scripts seed : `districts`, `subscription_plans`, 1 admin par défaut
- ✅ Toutes les politiques RLS activées et testées
- ✅ Sauvegardes Supabase configurées (PITR si possible)

### 11.4 Critères d'acceptation globaux

- Démo fonctionnelle bout-en-bout : client s'inscrit → admin valide → collecteur passe → client paie → renouvellement
- Temps de chargement < 3s sur connexion 3G mauritanienne
- Aucune donnée sensible côté client (clé service Supabase, secrets Firebase Admin)
- Documentation complète remise (technique + utilisateur)

---

## 12. Planning indicatif

**Hypothèse** : 1 développeur Flutter + 1 développeur Next.js, à temps plein.

| Semaine | Mobile (Flutter) | Web (Next.js) | Backend (DB + Edge) |
|---|---|---|---|
| 1 | Setup projet, flavors, auth | Setup modules, layout admin | Migrations §3.3, RLS de base |
| 2 | App client : écrans 1-8 | Module ménages + collecteurs | Endpoints `/api/me/*` |
| 3 | App client : écrans 9-14, notifs | Module planification | Endpoints `/api/driver/*` |
| 4 | App collecteur : écrans 1-5 | Module suivi temps réel + paiements | Optimisation itinéraire |
| 5 | App collecteur : écrans 6-9, mode offline | Module abonnements + renouvellements | Notifications FCM |
| 6 | Tests + corrections, polish | Module réclamations + rapports | CRON jobs |
| 7 | Builds release, tests devices | E2E tests, dockerisation | Seed prod |
| 8 | **Recette + déploiement** | **Recette + déploiement** | **Mise en prod** |

**Total : ~8 semaines (2 mois) pour un MVP solide.**

Buffer recommandé : +2 semaines pour imprévus, traduction arabe, formation admins.

---

## Annexes

- `docs/migrations/001_platform_extensions.sql` — DDL d'extension du schéma
- `docs/migrations/002_rls_policies.sql` — Politiques de sécurité RLS

---

**Contact projet** : mamadou.anne@itkann.org
**Version document** : 1.0 — 2026-06-05
