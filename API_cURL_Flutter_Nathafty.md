# API — Référentiel cURL pour les apps Flutter (Nathafty)

> Toutes les requêtes HTTP que les applications **Client** et **Collecteur** doivent émettre.
> Source : SPEC Plateforme Nathafty v1.0 (§7). Les valeurs d'exemple sont **illustratives** — confirmer les noms de champs exacts non spécifiés avec le développeur backend.

---

## 0. Conventions & variables

Les endpoints métier sont servis par le **backoffice Next.js** (`app/api/...`). L'authentification et le stockage de fichiers passent **directement par Supabase**.

```bash
# À adapter
export BASE_URL="https://backoffice.nathafty.mr"      # Next.js API Routes
export SUPABASE_URL="https://xxxxxxxx.supabase.co"    # projet Supabase
export ANON_KEY="eyJhbGciOiJ..."                       # clé anon publique (embarquée dans l'app)
export JWT="eyJhbGciOiJ..."                            # access_token obtenu après authentification (§1)
```

**Règles communes à tous les endpoints `$BASE_URL/api/...`** :
- Header obligatoire : `Authorization: Bearer $JWT`
- Réponses au format JSON : `{ "data": ..., "error": null }`
- Codes HTTP : `200` / `201` / `400` (payload invalide) / `401` (non authentifié) / `403` (interdit) / `404` / `500`

---

## 1. Authentification (Supabase) — obtenir le JWT

### 1.1 App Client — OTP par SMS

**Étape 1 — Demander l'envoi du code OTP**

```bash
curl -X POST "$SUPABASE_URL/auth/v1/otp" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "phone": "+22241234567" }'
```

**Étape 2 — Vérifier le code reçu par SMS → récupère le token**

```bash
curl -X POST "$SUPABASE_URL/auth/v1/verify" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "type": "sms", "phone": "+22241234567", "token": "123456" }'
```

Réponse (extrait) — `access_token` = le `$JWT` à utiliser ensuite :

```json
{
  "access_token": "eyJhbGciOiJ...",
  "refresh_token": "v1.M2Y...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": { "id": "uuid-du-user", "phone": "22241234567" }
}
```

### 1.2 App Collecteur — email + mot de passe

```bash
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "email": "moussa@nathafty.mr", "password": "********" }'
```

Même structure de réponse (`access_token`, `refresh_token`, `user`).

### 1.3 Rafraîchir la session (les deux apps)

```bash
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=refresh_token" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "refresh_token": "v1.M2Y..." }'
```

### 1.4 Déconnexion

```bash
curl -X POST "$SUPABASE_URL/auth/v1/logout" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT"
```

---

## 2. Upload de fichiers (Supabase Storage)

Avant d'envoyer une preuve de collecte ou une pièce jointe de réclamation, l'app **téléverse le fichier dans Storage**, récupère son URL, puis transmet cette URL au endpoint métier (`photo_url`).

### 2.1 Preuve de collecte → bucket `collection-proofs` (Collecteur)

```bash
curl -X POST \
  "$SUPABASE_URL/storage/v1/object/collection-proofs/2026/06/house-42-1717600000.jpg" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@preuve.jpg"
```

> ⚠️ Compresser la photo à **≤ 1 Mo** avant l'envoi.

### 2.2 Pièce jointe de réclamation → bucket `complaint-attachments` (Client)

```bash
curl -X POST \
  "$SUPABASE_URL/storage/v1/object/complaint-attachments/HH-2025-0042/photo-1.jpg" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@justificatif.jpg"
```

### 2.3 Construire l'URL à transmettre

- Bucket **public** : `"$SUPABASE_URL/storage/v1/object/public/collection-proofs/2026/06/house-42-1717600000.jpg"`
- Bucket **privé** : générer une URL signée

```bash
curl -X POST \
  "$SUPABASE_URL/storage/v1/object/sign/collection-proofs/2026/06/house-42-1717600000.jpg" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{ "expiresIn": 3600 }'
```

---

## 3. Endpoints — App Client

### 3.1 Profil du ménage connecté

```bash
curl -X GET "$BASE_URL/api/customer/household" \
  -H "Authorization: Bearer $JWT"
```

### 3.2 Mise à jour du profil (nom, adresse, GPS, WhatsApp)

```bash
curl -X POST "$BASE_URL/api/customer/household" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Aïcha Mint Ahmed",
        "address": "Tevragh Zeina, Rue 42",
        "whatsapp": "+22241234567",
        "latitude": 18.0858,
        "longitude": -15.9785
      }'
```

### 3.3 Calendrier des collectes (période)

```bash
curl -X GET "$BASE_URL/api/customer/collections?from=2026-06-01&to=2026-06-30" \
  -H "Authorization: Bearer $JWT"
```

### 3.4 Abonnement courant + historique

```bash
curl -X GET "$BASE_URL/api/customer/subscription" \
  -H "Authorization: Bearer $JWT"
```

### 3.5 Demande de renouvellement

```bash
curl -X POST "$BASE_URL/api/customer/renewal-request" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{ "plan_id": 2 }'
```

### 3.6 Historique des paiements

```bash
curl -X GET "$BASE_URL/api/customer/payments" \
  -H "Authorization: Bearer $JWT"
```

### 3.7 Mes réclamations (liste)

```bash
curl -X GET "$BASE_URL/api/customer/complaints" \
  -H "Authorization: Bearer $JWT"
```

### 3.8 Créer une réclamation

`photo_url` est l'URL obtenue à l'étape §2.2 (optionnelle).

```bash
curl -X POST "$BASE_URL/api/customer/complaints" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
        "category": "missed_collection",
        "description": "La poubelle n'\''a pas été ramassée mardi.",
        "photo_url": "https://xxxx.supabase.co/storage/v1/object/public/complaint-attachments/HH-2025-0042/photo-1.jpg"
      }'
```

> `category` ∈ `missed_collection` | `damage` | `billing` | `other`

### 3.9 Enregistrer le token FCM (au login + au refresh)

```bash
curl -X POST "$BASE_URL/api/customer/device-token" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{ "token": "fcm-device-token-xyz", "platform": "android" }'
```

### 3.10 Notifications non lues

```bash
curl -X GET "$BASE_URL/api/customer/notifications?unread=true" \
  -H "Authorization: Bearer $JWT"
```

### 3.11 Marquer une notification comme lue

```bash
curl -X POST "$BASE_URL/api/customer/notifications/123/read" \
  -H "Authorization: Bearer $JWT"
```

---

## 4. Endpoints — App Collecteur

### 4.1 Tournée du jour

```bash
curl -X GET "$BASE_URL/api/driver/today" \
  -H "Authorization: Bearer $JWT"
```

### 4.2 Détail d'une tournée

```bash
curl -X GET "$BASE_URL/api/driver/collections/57" \
  -H "Authorization: Bearer $JWT"
```

### 4.3 Itinéraire optimisé (V2 — optionnel)

Position de départ du collecteur passée en query (`lat`, `lng`).

```bash
curl -X GET "$BASE_URL/api/driver/route/57/optimize?lat=18.0858&lng=-15.9785" \
  -H "Authorization: Bearer $JWT"
```

### 4.4 Valider une collecte (preuve photo obligatoire)

`photo_url` = URL obtenue au §2.1 ; `lat`/`lng` capturés au moment de la validation.

```bash
curl -X POST "$BASE_URL/api/driver/houses/842/complete" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
        "photo_url": "https://xxxx.supabase.co/storage/v1/object/public/collection-proofs/2026/06/house-42-1717600000.jpg",
        "lat": 18.0858,
        "lng": -15.9785,
        "note": "RAS"
      }'
```

### 4.5 Marquer une maison comme non collectée

```bash
curl -X POST "$BASE_URL/api/driver/houses/842/skip" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{ "reason": "absent", "note": "Personne au domicile" }'
```

> `reason` ∈ `absent` | `refus` | `acces_bloque` | `autre`

### 4.6 Historique des tournées

```bash
curl -X GET "$BASE_URL/api/driver/history?from=2026-05-01&to=2026-05-31" \
  -H "Authorization: Bearer $JWT"
```

---

## 5. (Optionnel) Lectures directes Supabase via les vues

Pour des lectures simples protégées par RLS, l'app peut interroger Supabase directement (utilisé en pratique via `supabase_flutter`, montré ici en cURL équivalent).

### 5.1 Résumé ménage (calendrier) — `view_household_summary`

```bash
curl -X GET \
  "$SUPABASE_URL/rest/v1/view_household_summary?select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT"
```

### 5.2 Paiements ménage — `view_household_payments`

```bash
curl -X GET \
  "$SUPABASE_URL/rest/v1/view_household_payments?select=*" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $JWT"
```

> Le RLS garantit que chaque utilisateur ne voit que ses propres lignes ; pas besoin de filtrer manuellement par `household_id`.

---

## 6. Récapitulatif

| # | App | Méthode | Endpoint |
|---|-----|---------|----------|
| Auth | — | POST | `/auth/v1/otp`, `/auth/v1/verify`, `/auth/v1/token`, `/auth/v1/logout` |
| Storage | — | POST | `/storage/v1/object/{bucket}/{path}` |
| 1 | Client | GET | `/api/customer/household` |
| 2 | Client | POST | `/api/customer/household` |
| 3 | Client | GET | `/api/customer/collections?from=&to=` |
| 4 | Client | GET | `/api/customer/subscription` |
| 5 | Client | POST | `/api/customer/renewal-request` |
| 6 | Client | GET | `/api/customer/payments` |
| 7 | Client | GET | `/api/customer/complaints` |
| 8 | Client | POST | `/api/customer/complaints` |
| 9 | Client | POST | `/api/customer/device-token` |
| 10 | Client | GET | `/api/customer/notifications?unread=true` |
| 11 | Client | POST | `/api/customer/notifications/:id/read` |
| 12 | Collecteur | GET | `/api/driver/today` |
| 13 | Collecteur | GET | `/api/driver/collections/:id` |
| 14 | Collecteur | GET | `/api/driver/route/:collectionId/optimize?lat=&lng=` |
| 15 | Collecteur | POST | `/api/driver/houses/:id/complete` |
| 16 | Collecteur | POST | `/api/driver/houses/:id/skip` |
| 17 | Collecteur | GET | `/api/driver/history?from=&to=` |

---

_Document dérivé de la spécification « Plateforme Nathafty » v1.0 (5 juin 2026). Contact projet : mamadou.anne@itkann.org_
