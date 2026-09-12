# AUJ Store Management & POS System

An integrated retail Point-of-Sale (POS), inventory management, customized printing service calculator, and business analytics platform built with **Next.js 15 (App Router)** and **Supabase (PostgreSQL 17, Auth, SSR)**.

---

## 🌟 Core Features

* **Point of Sale (POS):** Fast product search, real-time cart subtotaling, custom print job attachments, order completion, and partial payment tracking.
* **Printing & Photocopying Service Calculator:** Configurable print jobs with paper types (copier, photo), sizes (short, A4, long, 2R–5R), color modes (B&W, color), page counts, and copies.
* **Inventory Management:** Full product cataloging, stock adjustment, cost/price margin tracking, categorizations, and low-stock threshold alerts.
* **Transaction History & Receipts:** Order tracking, searchable receipt inspection, line-item details, and customer debt management.
* **Financial Analytics & Dashboard:** Real-time revenue, gross profit, sales trends, category distribution charts, and low-stock notifications.
* **Security & Auth:** Cookie-based authentication via `@supabase/ssr` with PostgreSQL Row-Level Security (RLS) enforcement.

---

## 🛠️ Technology Stack

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, React 19)
* **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
* **Database & Backend:** [Supabase](https://supabase.com/) (PostgreSQL 17, Row Level Security, Supabase Auth)
* **Type Safety:** TypeScript, Generated Database Schema Types (`lib/database.types.ts`), [Zod](https://zod.dev/)
* **Charts & Data Tables:** [Recharts](https://recharts.org/), [TanStack Table v8](https://tanstack.com/table)

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18+ and npm
* Supabase project or Docker Desktop (for local database emulation)

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-publishable-key>
```

### 3. Install Dependencies & Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Code-First Database & Migrations Workflow

AUJ Store operates under a **code-first migration workflow**. Database schemas are version-controlled in `supabase/migrations/` rather than modified manually via the dashboard.

### Supabase CLI Commands

| NPM Script | Command | Purpose |
|:---|:---|:---|
| `npm run supabase:start` | `supabase start` | Spins up local Supabase stack in Docker |
| `npm run supabase:stop` | `supabase stop` | Stops local Supabase Docker containers |
| `npm run supabase:diff` | `supabase db diff` | Compares local migrations against database |
| `npm run supabase:migration:new <name>` | `supabase migration new <name>` | Generates a new timestamped migration file |
| `npm run supabase:push` | `supabase db push` | Applies pending local migrations to remote DB |
| `npm run supabase:types` | `supabase gen types ...` | Regenerates `lib/database.types.ts` from schema |

---

### Standard Workflow for Schema Changes

1. **Create a new migration file:**
   ```bash
   npm run supabase:migration:new add_new_feature_table
   ```
2. **Write SQL statements:** Add `CREATE TABLE`, `ALTER TABLE`, or `CREATE POLICY` statements in the newly created file under `supabase/migrations/`.
3. **Test against local or shadow database:**
   ```bash
   npx supabase db diff --db-url "$SUPABASE_DB_URL"
   ```
4. **Push migrations to production:**
   ```bash
   npx supabase db push --db-url "$SUPABASE_DB_URL"
   ```
5. **Regenerate TypeScript database types:**
   ```bash
   npm run supabase:types
   ```
6. **Commit the migration file and `lib/database.types.ts`** together in your git pull request.

---

## 📚 Project Documentation

Detailed design, architecture, and specifications are located in the [`docs/`](file:///c:/projects/webdevshiz/auj-store/docs) directory:

* 📄 [**Software Requirements Specification (SRS)**](file:///c:/projects/webdevshiz/auj-store/docs/srs.md)
* 📄 [**Database Architecture & ERD**](file:///c:/projects/webdevshiz/auj-store/docs/database.md)
* 📄 [**System & UI/UX Design Specification**](file:///c:/projects/webdevshiz/auj-store/docs/design-spec.md)
* 📄 [**Baseline Schema Comparison & Diff Notes**](file:///c:/projects/webdevshiz/auj-store/docs/other/schema-diff.md)
* 📄 [**Phase 8 Schema & Code Follow-Up Tasks**](file:///c:/projects/webdevshiz/auj-store/docs/other/follow-up-schema-cleanups.md)
