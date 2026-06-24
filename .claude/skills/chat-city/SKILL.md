---
name: chat-city
description: >
  Guide de développement pour le projet TRK Agriculture — plateforme e-commerce B2C/B2B
  pour une pépinière mauricienne (React 19 + Vite + Supabase + shadcn/ui + Netlify).
  Utilise ce skill dès que la demande concerne : ajouter une page ou une route, modifier le
  catalogue produits, toucher au panier/checkout, gérer les rôles admin/operator/user,
  intégrer Supabase (tables, RLS, auth), ajuster l'i18n FR/EN, configurer le PWA, ou
  déployer sur Netlify. S'applique également aux pages admin (/admin/*), aux lots de semis
  (pépinière), aux commandes B2B, ou à tout ajout de composant shadcn/ui.
---

# TRK Agriculture — Guide de développement

Plateforme e-commerce pour une pépinière agricole à Maurice (Île Maurice). Vente directe
de légumes, épices et salades en B2C et B2B (hôtels, restaurants). Déployée comme PWA
sur Netlify, backend Supabase.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19.x + Vite 8.x |
| Routing | React Router DOM 6 |
| UI / composants | shadcn/ui (style `new-york`, couleur `zinc`) + Lucide React |
| Styles | TailwindCSS 3 (couleur thème : `green-600` / `#16a34a`) |
| Backend / BDD | Supabase (PostgreSQL, Auth, Row Level Security) |
| i18n | i18next + react-i18next (langues : `fr` par défaut, `en`) |
| PWA | vite-plugin-pwa (autoUpdate) |
| Déploiement | Netlify (build `npm run build` → `dist/`) |
| Tests E2E | Playwright (configuré, non utilisé activement) |

**Pas de Three.js ni de WebGL dans ce projet.**

---

## Structure du dépôt

```
TRK-AGRICULTURE/
├── src/
│   ├── main.jsx                  # Point d'entrée React
│   ├── App.jsx                   # Déclaration des routes (BrowserRouter)
│   ├── assets/                   # SVG, images statiques
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx        # Navigation principale
│   │   │   ├── Footer.jsx
│   │   │   └── LanguageBar.jsx   # Sélecteur FR/EN
│   │   ├── ui/                   # Composants shadcn/ui (button, card, select…)
│   │   ├── ProductCard.jsx
│   │   ├── PromoBanner.jsx
│   │   ├── ProtectedAdminRoute.jsx
│   │   └── ScrollToTop.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx       # Auth Supabase + profil + rôles
│   │   └── CartContext.jsx       # État du panier
│   ├── hooks/
│   │   └── use-toast.js
│   ├── lib/
│   │   ├── supabase.js           # createClient (env vars)
│   │   ├── i18n.js               # Config i18next
│   │   ├── delivery.js           # Zones de livraison + calcul frais
│   │   ├── utils.js              # cn() et utilitaires
│   │   └── payments/
│   │       ├── index.js          # Registre de fournisseurs de paiement
│   │       └── JuiceManualProvider.js  # MCB Juice (confirmation manuelle)
│   ├── locales/
│   │   ├── fr/common.json        # ~460 clés de traduction françaises
│   │   └── en/common.json        # Traductions anglaises
│   └── pages/
│       ├── Home.jsx
│       ├── Catalog.jsx           # Filtre par catégorie
│       ├── ProductDetail.jsx     # Route /produit/:sku
│       ├── Cart.jsx              # /panier
│       ├── Checkout.jsx          # /commande
│       ├── OrderConfirmation.jsx # /commande/confirmee/:orderNumber
│       ├── B2B.jsx               # Formulaire devis B2B
│       ├── Account.jsx           # Historique commandes
│       ├── Login.jsx / Logout.jsx
│       ├── Calendrier.jsx        # Disponibilité saisonnière
│       ├── Nursery.jsx           # Lots de semis en cours (pépinière)
│       ├── NosProcess.jsx
│       ├── APropos.jsx / Contact.jsx
│       ├── Confidentialite.jsx / Privacy.jsx / MentionsLegales.jsx
│       └── admin/
│           ├── AdminLayout.jsx   # Shell admin (outlet + nav)
│           ├── AdminLoginPage.jsx
│           ├── AdminDashboard.jsx   # KPIs + commandes récentes
│           ├── AdminProductsList / Create / Edit / Detail
│           ├── AdminOrdersList / Detail
│           ├── AdminB2BList / Detail
│           ├── AdminSowingList.jsx  # Gestion lots semis
│           ├── AdminUsersList.jsx
│           └── AdminClientDetail.jsx
├── public/
│   ├── icons/                    # PWA icons (192/512, maskable)
│   └── .well-known/assetlinks.json  # TWA Android verification
├── schema.sql                    # Schéma Supabase complet
├── vite.config.js
├── netlify.toml
├── tailwind.config.js
├── components.json               # shadcn/ui config
└── .env.example                  # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MIPS_MERCHANT_ID
```

---

## Conventions de code

### Alias de chemin
Utiliser `@/` comme alias vers `src/` dans tous les imports :
```js
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
```

### Composants shadcn/ui
- Style : `new-york`, couleur de base : `zinc`
- Ajouter de nouveaux composants via : `npx shadcn@latest add <nom>`
- Les composants générés vont dans `src/components/ui/`

### Classes Tailwind
- Couleur principale : `green-600` (thème agri)
- Utilitaire `cn()` depuis `@/lib/utils` pour conditionner les classes

### i18n
- Toujours utiliser `useTranslation()` + clé `t('clé')` — jamais de texte en dur
- Ajouter toute nouvelle clé dans les DEUX fichiers `locales/fr/common.json` et `locales/en/common.json`
- Langue par défaut : `fr` ; détection automatique navigateur activée

---

## Base de données Supabase

### Tables principales

| Table | Rôle |
|-------|------|
| `profiles` | Extension de `auth.users` — champs `role` (`admin`/`operator`/`user`) |
| `products` | Catalogue, identifié par `sku` (slug URL) |
| `categories` | 5 types : épices, salades, brèdes, légumes, melons |
| `production_lots` | Lots de semis avec suivi avancement (pépinière) |
| `delivery_zones` | 9 districts mauriciens avec frais |
| `customers` | Profils B2C et B2B |
| `addresses` | Adresses de livraison |
| `orders` + `order_items` | Commandes |
| `b2b_inquiries` | Demandes de devis B2B |
| `b2b_subscriptions` + `subscription_items` | Abonnements récurrents |
| `deliveries` | Suivi de livraison |
| `testimonials` | Avis clients |

### Client Supabase
```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Toujours importer `supabase` depuis `@/lib/supabase`, ne jamais recréer de client.

### RLS
Les politiques RLS sont définies dans `schema.sql`. Toute nouvelle table doit activer RLS.
Les rôles `admin` et `operator` donnent accès aux routes `/admin/*`.

---

## Authentification et rôles

```js
// Depuis n'importe quel composant :
const { user, profile, role, isAdmin, isEmployee, signIn, signOut, loading } = useAuth()
```

| Valeur `role` | Accès |
|---------------|-------|
| `'admin'` | Toutes les routes admin, gestion utilisateurs |
| `'operator'` | Routes admin sauf gestion utilisateurs |
| `'user'` | Espace compte, historique commandes |
| `null` | Visiteur non connecté |

`ProtectedAdminRoute` redirige vers `/admin/login` si l'utilisateur n'est ni admin ni operator.

---

## Livraison

```js
// src/lib/delivery.js
export const FREE_DELIVERY_THRESHOLD = 0   // livraison gratuite sur toutes les commandes
export const DISTRICTS = [
  { name: 'Port Louis',         fee: 150 },
  { name: 'Pamplemousses',      fee: 150 },
  { name: 'Rivière du Rempart', fee: 200 },
  // … 9 districts au total
]
export function getDeliveryFee(districtName, subtotal) { … }
export function isValidMauritiusPhone(phone) { … }   // format 8 chiffres +230
```

Toute modification des frais ou zones se fait dans ce fichier.

---

## Paiements

Trois méthodes disponibles (registre dans `src/lib/payments/index.js`) :
- **COD** — Paiement à la livraison
- **Juice** — MCB Juice (confirmation manuelle via `JuiceManualProvider`)
- **MIPS** — Carte bancaire (affiché "bientôt disponible", nécessite `VITE_MIPS_MERCHANT_ID`)

Pour ajouter un fournisseur, implémenter l'interface du registre et l'enregistrer dans `index.js`.

---

## Workflow de déploiement

### Développement local

```bash
# Variables d'environnement (copier .env.example → .env)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Lancer le serveur de dev
npm run dev          # http://localhost:5174

# Build de production
npm run build        # génère dist/

# Prévisualiser le build
npm run preview
```

### Déploiement Netlify

Le projet a **un seul remote git** (`origin`) qui pointe vers GitHub. Netlify est connecté
à ce dépôt via webhook : chaque push sur la branche principale déclenche un build Netlify.

```bash
# Pousser les changements → déclenche le build Netlify automatiquement
git push origin <branche>
```

**Pas de remote `netlify` séparé.** La configuration de build est dans `netlify.toml` :
- Commande : `npm run build`
- Dossier publié : `dist/`
- En-têtes de sécurité configurés pour toutes les routes (`X-Frame-Options`, `CSP`, etc.)

### PWA

Le plugin `vite-plugin-pwa` génère le service worker et le manifest automatiquement.
Les icônes PWA (192px, 512px, maskable) sont dans `public/icons/`.
L'enregistrement est en mode `autoUpdate` — les mises à jour s'appliquent silencieusement.

---

## Ajout d'une nouvelle page

1. Créer `src/pages/MaPage.jsx`
2. Ajouter la route dans `src/App.jsx` :
   ```jsx
   <Route path="/ma-page" element={<MaPage />} />
   ```
3. Ajouter les clés i18n dans `locales/fr/common.json` et `locales/en/common.json`
4. Mettre à jour `Header.jsx` si la page doit apparaître dans la navigation

## Ajout d'une page admin

Routes admin nestées sous `<Route path="/admin" element={<AdminLayout />}>` dans `App.jsx`.
`AdminLayout` fournit la sidebar et la vérification des rôles via outlet.

---

## Variables d'environnement requises

| Variable | Usage |
|----------|-------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase (anon) |
| `VITE_MIPS_MERCHANT_ID` | ID marchand MIPS (optionnel, paiement carte) |

Les variables préfixées `VITE_` sont exposées au client. Ne jamais mettre de clé secrète
dans ces variables.
