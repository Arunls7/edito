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

## Installation

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
