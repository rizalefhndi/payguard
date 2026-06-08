# PayGuard — Project Overview

PayGuard is a Next.js 15 escrow/wallet web app. Users register as BUYER or SELLER, top up their wallet via Stripe, and eventually lock/release funds through an escrow flow.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **Auth**: NextAuth v5 (beta) with Credentials provider and JWT sessions — imported from `@/auth`
- **Database**: PostgreSQL via Prisma 5 — imported from `@/lib/prisma`
- **Payments**: Stripe v22 (API version `2026-04-22.dahlia`) — imported from `@/lib/stripe`
- **UI**: shadcn/ui components (`src/components/ui/`), Tailwind CSS v4, Radix UI
- **Forms**: react-hook-form + zod v4 for validation
- **Notifications**: sonner (`toast`) with `<Toaster>` mounted in root layout
- **Tables**: @tanstack/react-table
- **Date formatting**: date-fns

## Domain Models (Prisma)

- `User` — roles: `BUYER | SELLER | ADMIN`; each user gets exactly one `Wallet` created at registration
- `Wallet` — holds `balance: Decimal(18,2)`; linked to `Transaction[]`
- `Transaction` — types: `TOPUP | ESCROW_LOCK | ESCROW_RELEASE | REFUND`; `stripeId` is unique for idempotency
- `Escrow` — statuses: `PENDING | FUNDED | RELEASED | REFUNDED | DISPUTED`; links `buyerId` + `sellerId`
- `Account` / `Session` — NextAuth adapter tables

## Route Structure

```
/                      → landing (src/app/page.tsx)
/login                 → (auth) group, client component
/register              → (auth) group, client component
/dashboard             → protected server component
/dashboard/topup       → protected client component
/api/auth/register     → POST — create user + wallet
/api/auth/[...nextauth]→ NextAuth handler
/api/stripe/checkout   → POST — create Stripe Checkout session
/api/stripe/webhook    → POST — Stripe webhook (idempotent)
```

Middleware at `src/middleware.ts` protects `/dashboard/:path*` using the NextAuth `auth` export.
