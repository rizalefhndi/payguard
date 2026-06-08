# PayGuard

PayGuard is a full-stack escrow and digital wallet platform built with Next.js 15. It enables secure peer-to-peer transactions between buyers and sellers by holding funds in escrow until both parties fulfill their obligations. When a dispute arises, an administrator intervenes to review the case and issue a binding resolution.

---

## Features

### Wallet and Payments
- User wallet with a running balance stored as `Decimal(18, 2)`
- Top-up via Stripe Checkout; balance credited automatically through a webhook
- Full transaction history with filtering by type, date range, and description text
- Idempotent webhook handling using the Stripe session ID as a unique key

### Escrow Engine
- Buyer locks funds from their wallet into an escrow record (status: `FUNDED`)
- Buyer can release funds to the seller (`RELEASED`) or request a refund (`REFUNDED`)
- Release and refund are blocked while a dispute is open

### Dispute Workflow
- Seller files a dispute on any `FUNDED` escrow, providing a written reason
- Buyer responds to the dispute in writing
- Administrator reviews both sides and resolves the dispute by releasing funds to the seller or refunding the buyer
- Resolution updates the escrow status atomically within a database transaction

### Notifications
- In-app notification feed stored in the database
- Events that trigger notifications: escrow created, funds released, refund issued, dispute filed, dispute responded, dispute resolved, top-up succeeded
- Bell icon in the navigation bar displays the unread count
- Dropdown shows the six most recent notifications with mark-as-read support
- Full notification history page with grouped-by-date display

### Role-Based Access
- Three roles: `BUYER`, `SELLER`, `ADMIN`
- Each role sees a different dashboard on the overview page
- Seller-specific sales dashboard showing revenue, active escrows, and recent payouts
- Admin panel with platform-wide statistics, a dispute management queue, and a user management table with inline role editing

### User Management (Admin)
- Searchable and filterable table of all registered users
- Filter by role with clean URL state via `URLSearchParams`
- Paginated at 20 records per page
- Inline role selector with optimistic feedback; admin cannot demote their own account

### Profile and Settings
- Update display name and email address with uniqueness validation
- Change password with current-password verification via bcrypt

### Developer Experience
- Top loading bar on every page transition via `next-nprogress-bar`
- Per-route `loading.tsx` skeleton screens for all dashboard pages
- Server Actions for all mutations; no custom API routes for business logic
- Prisma transactions used everywhere money or status changes hands

---

## Installation

### Prerequisites

- Node.js 20 or later
- PostgreSQL database
- Stripe account with a webhook configured

### Steps

**1. Clone the repository**

```bash
git clone <repository-url>
cd payguard
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the project root with the following keys:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/payguard"

NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

**4. Run database migrations**

```bash
npx prisma migrate dev
```

**5. Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Stripe Webhook (local development)

To receive webhook events during local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the signing secret printed by the CLI and set it as `STRIPE_WEBHOOK_SECRET` in your `.env` file.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Apply pending migrations and regenerate the client |
| `npx prisma studio` | Open Prisma Studio to inspect database records |

---

## Folder Structure

```
payguard/
├── prisma/
│   ├── migrations/          # Migration history
│   └── schema.prisma        # Data models and enums
│
├── src/
│   ├── actions/             # Next.js Server Actions
│   │   ├── admin.ts         # updateUserRole
│   │   ├── dispute.ts       # fileDispute, respondToDispute, resolveDispute
│   │   ├── escrow.ts        # createEscrow, releaseFunds, refundEscrow, getEscrows
│   │   ├── notifications.ts # markAsRead, markAllAsRead, getUnreadCount
│   │   └── profile.ts       # updateProfile, changePassword
│   │
│   ├── app/
│   │   ├── _landing/        # Landing page section components (not a route)
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── api/
│   │   │   ├── auth/        # NextAuth handler and registration endpoint
│   │   │   ├── stripe/      # Checkout session creation and webhook receiver
│   │   │   └── users/       # Sellers list endpoint
│   │   ├── dashboard/
│   │   │   ├── admin/users/ # User management (admin only)
│   │   │   ├── disputes/    # Dispute queue (admin only)
│   │   │   ├── escrow/      # Escrow list, new escrow form, detail page
│   │   │   ├── notifications/
│   │   │   ├── sales/       # Seller sales dashboard
│   │   │   ├── settings/    # Profile and password settings
│   │   │   ├── topup/       # Top-up amount selector
│   │   │   ├── transactions/
│   │   │   ├── layout.tsx   # Shared dashboard shell (sidebar + navbar)
│   │   │   └── page.tsx     # Role-aware overview page
│   │   ├── globals.css
│   │   ├── layout.tsx       # Root layout (fonts, toaster, progress bar)
│   │   └── page.tsx         # Public landing page
│   │
│   ├── components/
│   │   ├── dashboard/       # Sidebar, navbar, admin overview, role select
│   │   ├── notifications/   # Bell icon, dropdown, mark-all button
│   │   ├── settings/        # Profile form, password form
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── dispute-panel.tsx
│   │   ├── escrow-actions.tsx
│   │   └── progress-bar.tsx
│   │
│   ├── lib/
│   │   ├── notify.ts        # createNotif / createNotifMany helpers
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── stripe.ts        # Stripe client
│   │   └── utils.ts         # cn utility
│   │
│   ├── types/
│   │   └── next-auth.d.ts   # Session type augmentation (id, role)
│   │
│   ├── auth.ts              # NextAuth configuration
│   └── middleware.ts        # Route protection for /dashboard/:path*
```

---

## Data Models

| Model | Purpose |
|---|---|
| `User` | Registered account with role (`BUYER`, `SELLER`, `ADMIN`) |
| `Wallet` | One-to-one with User; stores current balance |
| `Transaction` | Ledger entry for every balance change |
| `Escrow` | Holds a locked amount between a buyer and a seller |
| `Dispute` | One-to-one with Escrow; records the dispute thread and resolution |
| `Notification` | Per-user event log with read state |
| `Account` / `Session` | NextAuth adapter tables |

### Escrow status transitions

```
PENDING
  └── FUNDED        (escrow created, funds deducted from buyer)
        ├── RELEASED    (buyer releases funds to seller)
        ├── REFUNDED    (buyer requests refund)
        └── DISPUTED    (seller files a dispute)
                          ├── RELEASED    (admin resolves in seller's favour)
                          └── REFUNDED    (admin resolves in buyer's favour)
```

---

## Technology Stack

| Category | Library / Tool | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| UI | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| Component Library | shadcn/ui, Radix UI | -- |
| Authentication | NextAuth v5 (beta) | 5.0.0-beta |
| Database ORM | Prisma | 5.x |
| Database | PostgreSQL | -- |
| Payments | Stripe | 22.x |
| Form Handling | React Hook Form | 7.x |
| Validation | Zod | 4.x |
| Notifications (toast) | Sonner | 2.x |
| Date Utilities | date-fns | 4.x |
| Password Hashing | bcryptjs | 3.x |
| Progress Bar | next-nprogress-bar | 2.x |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Secret used to sign session tokens |
| `NEXTAUTH_URL` | Yes | Canonical URL of the application |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (if needed on the client) |
