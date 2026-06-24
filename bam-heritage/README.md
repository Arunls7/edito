# BAM l'Heritage — Site officiel

Club de boxe et MMA aux Mureaux, Yvelines. Affilie FFB.

## Stack technique

- **Frontend** : React + Vite + Tailwind CSS
- **Backend** : Node.js + Express + Prisma ORM
- **BDD** : PostgreSQL (Supabase en production)
- **Auth** : JWT (roles MEMBRE / ADMIN)
- **Paiements** : HelloAsso (cotisations) + Stripe (boutique / billetterie)
- **Emails** : Resend
- **Deploiement** : Vercel (frontend) + Railway (backend)

## Installation rapide

### Backend

```bash
cd bam-heritage/backend
cp .env.example .env
# Remplir les variables d'environnement
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd bam-heritage/frontend
cp .env.example .env
npm install
npm run dev
```

## Variables d'environnement

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL PostgreSQL (Supabase) |
| `JWT_SECRET` | Cle secrete JWT (min 32 chars) |
| `STRIPE_SECRET_KEY` | Cle secrete Stripe (`sk_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe (`whsec_...`) |
| `HELLOASSO_CLIENT_ID` | ID client HelloAsso |
| `HELLOASSO_CLIENT_SECRET` | Secret HelloAsso |
| `RESEND_API_KEY` | Cle API Resend (`re_...`) |
| `FRONTEND_URL` | URL du frontend |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL de l'API backend |
| `VITE_STRIPE_PUBLIC_KEY` | Cle publique Stripe (`pk_...`) |

## Webhook Stripe

Configurer un webhook Stripe vers :
`https://votre-backend.railway.app/api/webhook/stripe`

Evenement : `checkout.session.completed`
