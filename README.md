# CreditSwap

A peer-to-peer dining credit marketplace for NUS residential college students. Students can list excess meal credits (breakfast or dinner), browse listings from their dining hall, propose swaps, and confirm transfers — all through a clean, real-time web interface.

## Features

- **Listings marketplace** — Create offers or requests for breakfast/dinner credits, filtered by dining hall and credit type, with 48-hour auto-expiry and daily rate limiting
- **Swap workflow** — Propose, accept, and dual-confirm swaps with atomic credit transfers and balance validation
- **In-app messaging** — Chat with counterparties within each swap to coordinate details
- **Authentication** — Sign up and log in with NUSNET ID and password (bcrypt-hashed)
- **Profile management** — View/edit personal info, dining hall, Telegram handle, and credit balances; dining hall changes auto-cancel active swaps with user confirmation

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js API routes, Zod validation, middleware auth
- **Database:** SQLite via Prisma ORM
- **Auth:** bcryptjs password hashing, httpOnly secure cookies

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Name    | NUSNET ID  | Password      | Dining Hall |
|---------|-----------|---------------|-------------|
| Alice   | E1430273  | password123   | RVRC        |
| Bob     | E1837291  | password123   | RVRC        |
| Charlie | E1038391  | password123   | RVRC        |
| David   | E1182743  | password123   | Cendana     |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed database with demo users and listings |
| `npm run db:reset` | Reset database and re-run migrations |

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, listings, swaps, profile)
│   ├── listing/[id]/  # Listing detail page
│   ├── swap/[id]/     # Swap detail + messaging page
│   ├── login/         # Login page
│   ├── signup/        # Signup page
│   ├── profile/       # Profile view/edit page
│   └── page.tsx       # Home — marketplace listings
├── components/        # Reusable UI components
├── lib/               # Auth, DB, constants, validations, formatting
├── providers/         # AuthProvider context
└── types/             # TypeScript interfaces
prisma/
├── schema.prisma      # Database schema
├── seed.ts            # Demo data seeder
└── migrations/        # SQL migrations
```

## Team

Built for the NUS Residential College Hackathon 2026.
