# Edito — Dev Setup

Scaffold du MVP. Stack : Next.js 15 (App Router) + TypeScript strict + Tailwind v4 + Clerk (auth) + Convex (DB + storage) + Anthropic API (agent) + Deepgram (transcription).

## Prérequis

- Node.js ≥ 20
- pnpm (ou npm/yarn)
- Comptes gratuits sur : [Clerk](https://clerk.com), [Convex](https://convex.dev), [Anthropic](https://console.anthropic.com), [Deepgram](https://console.deepgram.com)

## Setup 1ère fois

```bash
# 1. Install
pnpm install

# 2. Variables d'env
cp .env.example .env.local
# → Remplis NEXT_PUBLIC_CLERK_*, CLERK_SECRET_KEY, ANTHROPIC_API_KEY, DEEPGRAM_API_KEY

# 3. Init Convex (ça crée le projet et l'URL automatiquement)
npx convex dev
# → Suis les instructions, ça remplit NEXT_PUBLIC_CONVEX_URL dans .env.local

# 4. Configurer Clerk ↔ Convex
# - Dans Clerk dashboard → JWT Templates → New Template "convex"
# - Issuer URL : copie-la dans .env.local comme CLERK_JWT_ISSUER_DOMAIN
# - Audience : "convex"

# 5. Run dev
pnpm dev
# → http://localhost:3000
```

## Structure

```
app/
  page.tsx              ← Landing
  layout.tsx            ← ClerkProvider + ConvexClientProvider
  dashboard/page.tsx    ← Liste projets + upload
  project/[id]/page.tsx ← Éditeur (preview + timeline + chat)
  api/
    agent/route.ts      ← POST → Claude tool use
    transcribe/route.ts ← POST → Deepgram

components/
  upload-zone.tsx       ← Drag-drop → Convex storage
  video-player.tsx      ← HTML5 video
  timeline.tsx          ← Timeline DOM minimale
  chat.tsx              ← Chat UI avec tool cards
  convex-client-provider.tsx

convex/
  schema.ts             ← projects, segments, transcripts, messages
  projects.ts           ← mutations + queries

lib/
  utils.ts              ← cn() helper

middleware.ts           ← Routes protégées
```

## Ce qui marche maintenant

- ✅ Auth Clerk (sign in / sign up modaux)
- ✅ Upload vidéo drag-drop vers Convex storage
- ✅ Liste des projets dans le dashboard
- ✅ Page projet avec lecture HTML5
- ✅ Chat qui parle à Claude avec 4 tools définis
- ✅ Tool calls retournés et affichés dans le chat

## Ce qui reste à brancher (ordre suggéré)

1. **Transcription** — bouton "Transcrire" sur la page projet → POST /api/transcribe → save dans Convex
2. **Apply `remove_silences`** — utiliser le transcript pour créer les `segments` à garder
3. **Apply `add_captions`** — overlay sur le player en lisant les utterances
4. **Export** — concat des segments via FFmpeg (Vercel function ou Modal)
5. **Persist messages** — utiliser la table `messages` Convex au lieu du state React local

## Budget mensuel estimé en dev solo

- Vercel : **0 €** (hobby)
- Convex : **0 €** (free tier, 1 GB)
- Clerk : **0 €** (10k MAU)
- Cloudflare R2 : **0 €** (jusqu'à 10 GB)
- Deepgram : **0 €** ($200 credit signup, ~800h)
- Anthropic API : **~5–10 €** (test perso, Sonnet 4.6 in/out)

**Total : <15 €/mois** tant qu'on est en dev/beta fermée.

## Notes

- `app/project/[id]/page.tsx` utilise `use(params)` car les params sont Promise en Next 15.
- Convex storage sert pour l'instant tout (vidéo + thumbs). Migrer vers R2 en M2 si on dépasse 1 GB.
- Modèle Claude : `claude-sonnet-4-5` (à mettre à jour selon le modèle le plus récent disponible côté API).
- Tailwind v4 : config dans `styles/globals.css` via `@theme`, pas de `tailwind.config.ts`.

## Commandes utiles

```bash
pnpm dev              # Next dev
pnpm convex:dev       # Convex en watch
pnpm typecheck        # Vérif TS
pnpm lint             # ESLint
pnpm build            # Build prod
```

## Déploiement

1. Push sur GitHub
2. Import dans Vercel
3. Ajouter les vars d'env (Clerk, Convex prod URL, Anthropic, Deepgram)
4. `npx convex deploy --prod` pour pousser le backend Convex en prod
