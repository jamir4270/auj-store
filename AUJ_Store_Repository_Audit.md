# AUJ Store Management — Repository Audit

**Audit type:** Codebase / architecture / functional review
**Purpose:** Establish a factual baseline of the project's current state (who/what/when/how) to support future SRS, function-list, and technical documentation, and to identify risk areas before onboarding a real user base.
**Scope:** Full repository as provided (Next.js App Router + Supabase project, "AUJ Store").
**Not in scope:** Live database contents, actual Supabase dashboard configuration (RLS beyond what's in `auj_db_schema.md`), deployment/hosting configuration, performance testing under load.

> Note on approach: Supabase is not managed code-first in this repo (no migrations folder), so all schema statements below are derived solely from `auj_db_schema.md` cross-referenced against the TypeScript models and queries in the code. Where the two disagree, it is flagged explicitly.

---

## 1. Executive Summary

AUJ Store Management is a Next.js 15/16 + Supabase inventory, sales (order), and print-job tracking system for a sari-sari/school-supplies style store. It was built on top of the official `with-supabase` starter template, and a large share of the original scaffold (tutorial components, starter README, starter logos) is still present and unused.

The application is functionally usable for its two core modules — **Inventory** and **Product Sales (Orders)** — plus a read-only **Sales History** and a **Dashboard**. **Print Job** and **Analytics** are explicitly unfinished stub pages. The codebase shows clear signs of being an early/learning project: inconsistent error handling, no authorization layer beyond blanket Supabase RLS, no automated tests, several functional bugs (one of which silently limits order stock updates to a single line item — see 5.1), copy/paste duplication across chart components, and a schema/query mismatch on the print jobs table.

None of the issues found are unrecoverable, but several (5.1, 5.2, 5.3, 6.1) should be treated as pre-launch blockers given that real inventory and real money (sales) will now be tracked.

---

## 2. Tech Stack & Architecture

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js (App Router), version pinned to `latest` in `package.json` (resolves to 16.1.1 per lockfile) | Uses React 19.2.3 |
| Language | TypeScript (strict mode enabled in `tsconfig.json`) | |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), `tailwindcss-animate` | CSS variables theme (`app/globals.css`), light/dark via `next-themes` |
| UI kit | shadcn/ui ("new-york" style, per `components.json`), Radix UI primitives | |
| Data/table | `@tanstack/react-table` (inventory table) | |
| Charts | `recharts` | 4 near-duplicate chart components (see 7.4) |
| Backend/DB | Supabase (Postgres + Auth), accessed via `@supabase/ssr` and `@supabase/supabase-js` | No code-first migrations; schema lives only in Supabase dashboard, exported into `auj_db_schema.md` |
| Auth | Supabase Auth (email/password), session refreshed via `proxy.ts` (Next.js middleware-equivalent) | |
| Notifications | `sonner` toast library | Used consistently for CRUD feedback |
| Validation | `zod` (partial — only on inventory forms) | |
| Icons | `lucide-react` | |
| Tooling | ESLint 9 (`next/core-web-vitals`, `next/typescript`), no Prettier config found | |
| Testing | **None found** — no test runner, no `__tests__`, no CI config | |

### 2.1 High-level route map

```
/                                  → LoginPage (duplicate of /auth/login)
/auth/login, /auth/sign-up, /auth/forgot-password, /auth/update-password, /auth/sign-up-success, /auth/error
/auth/confirm                      → OTP/email confirmation route handler
/protected/main/dashboard          → KPI + charts
/protected/main/orders             → Point-of-sale style order entry
/protected/main/print-job          → STUB ("Still in development!")
/protected/main/inventory          → Product CRUD + table
/protected/main/analytics          → STUB ("This is Analytics page.")
/protected/main/history            → Sales history browser
```

Route protection is handled centrally in `proxy.ts` → `lib/supabase/proxy.ts` (`updateSession`), which redirects any unauthenticated request (except `/`, `/auth/*`) to `/auth/login`.

---

## 3. Feature Inventory (What Actually Works Today)

| Module | Status | Description |
|---|---|---|
| **Auth** | ✅ Working | Sign up, login, logout, forgot/reset password, email OTP confirmation. Client-side only validation. |
| **Dashboard** | ✅ Working | Today's gross sales/net profit/products sold, top-5 products, low-stock and out-of-stock lists, toggleable Profit/Sales × Daily/Accumulated line/area charts over 7/15/30-day windows. |
| **Inventory** | ✅ Working (core CRUD) | Add/edit/delete product, add stock, category management (existing or freeform new category), sortable/filterable product table, aggregate stock-value/status cards. |
| **Product Sales (Orders)** | ⚠️ Working but with a significant bug (5.1) | Search products, build a cart-like order, submit order → writes `orders` + `order_items`, decrements product `quantity`. |
| **Sales History** | ⚠️ Working but fragile (5.4) | Date-picker driven day view of `order_items` joined to `products`, with client-side name search. |
| **Print Job** | ❌ Not implemented | Page renders placeholder text only. Sidebar link exists. DB tables (`print_job`, `service_rates`) exist but are unused by any UI. Confirmed intentionally deferred per project notes. |
| **Analytics** | ❌ Not implemented | Page renders placeholder text only. Sidebar link exists. |

---

## 4. Database Schema (as documented) vs. Code

Source of truth used: `auj_db_schema.md` (5 tables: `orders`, `order_items`, `products`, `print_job`, `service_rates`).

### 4.1 Schema summary

- `orders(id, total, status, partial_payment, created_at, updated_at, total_profit)`
- `order_items(id, order_id, product_id, quantity, unit_price_at_sale, subtotal, created_at, profit)`
- `products(id, name, quantity, price, created_at, category, stock_threshhold, cost, updated_at)`
- `print_job(id, order_id, service_type, paper_type, paper_size, color_mode, page_count, copies, subtotal, created_at)`
- `service_rates(id, service_type, paper_type, paper_size, color_mode, price, created_at, updated_at, profit)`

RLS is enabled on all 4 core tables and scoped only to `authenticated` vs `public`/`anon` — **there is no per-role or per-user separation** (see 6.1).

### 4.2 Confirmed mismatches between schema, models, and queries

| # | Location | Issue |
|---|---|---|
| M1 | `lib/data.ts` → `fetchPrintJobs()` queries `.from("print_jobs")` (**plural**) | Schema documents the table as `print_job` (**singular**). This call will fail against the documented schema. Either the schema doc is stale, or this function is dead/broken. Needs verification directly against the live Supabase project. |
| M2 | `lib/models.ts` → `Product.status?: ProductStatus` | Not a column in the `products` table at all — it is computed at read-time in `fetchProducts()` (`lib/data.ts`) and again independently in `inventory/page.tsx` and `order-page-interface.tsx`. Works, but the same in/low/out-of-stock logic is duplicated in 3+ places with no shared helper. |
| M3 | `Product.stock_threshhold` | Misspelling ("threshhold") is baked into the DB column name itself and propagated through the entire codebase (models, zod schema, forms, table columns). Cosmetic, but will keep confusing new contributors and any generated documentation. |
| M4 | `lib/models.ts` → `Order.partial_payment: number` (required) | Schema marks `partial_payment` as nullable. Model should mark it optional to match, or the column should be made non-nullable in the DB with a default. |
| M5 | `PrintJob` model uses `string | null` for `id`/`order_id`, while every other model uses `id?: string` | Stylistic inconsistency, not a bug, but worth normalizing before writing a data dictionary. |
| M6 | `products.quantity` and `order_items.quantity` are `int8` (Postgres bigint) | Supabase-js can return `int8` as a `string` in some client configurations. No explicit `Number()`/`parseInt` coercion guard exists where these values are read (e.g., `addStock`, `UpdateProductAfterSale`). Should be explicitly verified against the live client config. |

---

## 5. Functional Bugs & Defects

Severity key: **🔴 Critical** (data integrity / money-affecting), **🟠 Major** (broken feature/edge case), **🟡 Minor** (cosmetic/UX), **⚪ Code smell** (works, but risky).

### 5.1 🔴 Order submission only updates stock for the **first** product in an order
**File:** `app/protected/main/orders/actions.ts` → `UpdateProductAfterSale()`

```ts
for (const product of products) {
  const { status, error } = await supabase
    .from("products")
    .update({ quantity: product.quantity - (product.amount ?? 1) })
    .match({ id: product.id });
  if (error) { throw error as Error; }
  revalidatePath("/protected/orders");
  return status;          // ← returns/exits the function after the FIRST iteration
}
```
The `return status;` sits **inside** the `for` loop, so the function returns after processing only the first order item. **Every multi-item order under-decrements stock** for every item after the first — inventory quantities silently drift from reality on any order with 2+ distinct products. This is the single highest-priority defect in the repository, because it directly corrupts inventory data going forward and is invisible to the user (no error is thrown; the order still records correctly in `orders`/`order_items`).

### 5.2 🔴 `revalidatePath` targets the wrong routes
**Files:** `app/protected/main/inventory/actions.ts`, `app/protected/main/orders/actions.ts`

Actions call:
- `revalidatePath("/protected/inventory")` — but the real route is `/protected/main/inventory`
- `revalidatePath("/protected/orders")` — but the real route is `/protected/main/orders`

Because the paths don't match any actual route, Next.js's cache for the real inventory/orders pages is **never invalidated** by these calls. In practice the app still appears to work because these routes already opt out of static caching in other ways (client components fetching fresh data / `force-dynamic` on the parent layout), but this is masking the bug rather than fixing it, and will bite as soon as caching behavior changes.

### 5.3 🔴 No stock validation or atomic decrement on sale
**File:** `app/protected/main/orders/actions.ts`, `app/protected/main/orders/_components/order-page-interface.tsx`

- Quantity available to sell is only enforced client-side (`max={product.quantity}` on the `<Input>` in `OrderItemCard`). There is no server-side check that `quantity - amount >= 0` before writing.
- The decrement itself is a **read-then-write** using a client-supplied `product.quantity` snapshot, not an atomic SQL decrement (e.g., `quantity = quantity - X` inside the `UPDATE`). Two concurrent sales of the same product (e.g., two cashiers/devices) can both read the same starting quantity and overwrite each other's decrement — a classic lost-update race condition. Low risk today with a single user, but explicitly called out because "now it will have an actual user" per the project owner's own framing, and likely more than one register/device over time.
- There is also no transaction/rollback: if the `order_items` insert fails after `orders` insert succeeds, an orphaned empty order remains (`submitNewOrder` catch block just logs and returns the error; the order row is not cleaned up).

### 5.4 🟠 Unescaped user input passed into `String.prototype.match()` (regex) for search
**Files:**
- `app/protected/main/history/page.tsx` — `item.name.toLowerCase().match(searchValue.toLowerCase())`
- `app/protected/main/orders/_components/order-page-interface.tsx` — `product.name.toLowerCase().match(searchInput)`

`.match()` treats its argument as a **regular expression**, not a plain substring. Typing an unescaped regex metacharacter (e.g., `(`, `[`, `*`, `+`) into either search box throws a runtime error (`SyntaxError: Invalid regular expression`) that will crash the filtering logic (and, depending on React error boundaries — none are present in the app — potentially the whole subtree). Should be `.includes()`, or the input should be escaped before use.

### 5.5 🟠 "Debounced" search inputs are not actually debounced
**Files:** `app/protected/main/history/page.tsx`, `app/protected/main/orders/_components/order-page-interface.tsx`

```ts
onChange={(event) =>
  setTimeout(() => { setSearchValue(event.target.value); }, 300)
}
```
Every keystroke schedules a new `setTimeout` with no `clearTimeout` of the previous one. This is **not** debouncing — it fires (out of order, potentially) once per keystroke after a 300ms delay, and can visibly "stutter" the filtered results while typing quickly. Contrast with `DebouncedInput` in `app/protected/main/inventory/_components/products-table.tsx`, which implements this correctly with `useEffect` + `clearTimeout`. The correct pattern already exists in the codebase and simply wasn't reused elsewhere.

### 5.6 🟡 Division-by-zero on an empty inventory
**File:** `app/protected/main/inventory/page.tsx`

```ts
const in_stock_percentage = (in_stock_count / products.length) * 100.0;
```
If `products.length === 0` this is `NaN`, which is then interpolated into `width: NaN%` on the stock-mix bar. No empty-state UI exists for a brand-new store with zero products.

### 5.7 🟡 Dead/no-op click handler on "Add Stock"
**File:** `app/protected/main/inventory/_components/raw-actions.tsx`

```tsx
<Button type="submit" onClick={() => handleAddStockSubmit}>
```
The arrow function returns a reference to `handleAddStockSubmit` without calling it — this `onClick` does nothing. Harmless only because the surrounding `<form action={handleAddStockSubmit}>` already handles submission; the stray `onClick` should be removed to avoid confusing future maintainers.

### 5.8 🟡 Sales History initial-load logic is dead code
**File:** `app/protected/main/history/page.tsx`

A `useEffect` that would fetch "yesterday's" order items on first render is commented out. The page still populates on first paint only because the child `DatePicker` component (`_components/date-picker.tsx`) independently fetches on mount via its own effect (defaulting to "today"). The commented block should be deleted, and the fact that two components both own "what date range is loaded" logic should be consolidated.

### 5.9 🟡 Misleading `catch` condition
**File:** `app/protected/main/inventory/actions.ts` → `editProduct`

```ts
} catch (error) {
  if (error) {                 // always true for a thrown value
    console.error("Failed to edit product in products table: ", error);
  }
}
```
The guard should be `error instanceof Error` (as done correctly elsewhere in the same file, e.g. `addStock`). Not harmful today, just inconsistent and slightly misleading.

### 5.10 ⚪ Inconsistent error return contracts across server actions
`addProduct` returns the raw Supabase `error` object on failure (not a typed result); `editProduct`/`addStock` return `undefined` on failure; `deleteProduct` returns `void` either way. Callers (`toast.promise(...)`) don't actually inspect these return values to decide success/failure — the toast always resolves to its "success" message unless the **promise itself rejects**, which it never does here because every action swallows its errors internally with `try/catch`. **In effect, the user always sees a "Successfully added/updated/deleted" toast even when the underlying database write failed.** This is a meaningful trust/UX problem, not just a style nit.

---

## 6. Security & Access Control Findings

### 6.1 🔴 No application-level authorization — everything relies on blanket RLS
Every server action (`addProduct`, `editProduct`, `deleteProduct`, `addStock`, `submitNewOrder`) performs its Supabase call with whatever session cookie is present and does **no additional role/permission check**. Per `auj_db_schema.md`, all RLS policies are scoped to the single Postgres role `authenticated` — there is no `admin` vs. `staff`/`cashier` distinction in the database despite one policy being *named* `Enable insert for admin users only` (it is not actually restricted to admins; it grants insert to any authenticated user). 

Practical implication: **any account that can log in can add, edit, or delete any product, and can submit orders that mutate stock** — there is no cashier-vs-manager separation, no read-only role, no audit trail of who performed which mutation (no `created_by`/`updated_by` columns anywhere in the schema). If this system is meant to support more than a single trusted operator, this needs to be designed deliberately (Supabase custom claims/roles + policy rewrite, or an app-level permission check) before onboarding additional staff accounts.

### 6.2 🟠 No audit trail
No table records *who* created/edited/deleted a product or submitted/voided an order — only timestamps. For a store that will now involve a real, non-developer user (and possibly multiple staff), this makes it impossible to answer "who changed this price" or "who voided/edited this sale" after the fact.

### 6.3 🟡 Client-side password confirmation only
`components/sign-up-form.tsx` checks `password !== repeatPassword` in the browser only; there's no equivalent express password policy (length/complexity) enforced anywhere beyond whatever Supabase Auth defaults are configured.

### 6.4 🟡 Non-null assertions on env vars
`lib/supabase/client.ts`, `lib/supabase/server.ts`, and `lib/supabase/proxy.ts` all use `process.env.NEXT_PUBLIC_SUPABASE_URL!` / `...PUBLISHABLE_KEY!`. If these are ever missing in an environment (e.g., a misconfigured deploy), the failure mode is an unhandled runtime exception rather than a clear startup error. There **is** an `EnvVarWarning` component in the repo built exactly for this purpose (`components/env-var-warning.tsx`), but it is not wired into any page in the provided code — it appears to be orphaned leftover from the starter template.

### 6.5 ⚪ Redundant/confusing middleware exclusion
`lib/supabase/proxy.ts` excludes `request.nextUrl.pathname.startsWith("/login")` from the auth redirect, but the actual login route in this app is `/auth/login` (covered separately by the `/auth` exclusion). The `/login` check is dead logic — harmless, but should be removed for clarity.

---

## 7. Code Quality & Technical Debt

### 7.1 Leftover starter-template scaffolding (not used by the app)
These files are remnants of the original Next.js + Supabase starter kit and do not appear to be referenced anywhere in the current application:
- `components/tutorial/*` (`fetch-data-steps.tsx`, `connect-supabase-steps.tsx`, `sign-up-user-steps.tsx`, `tutorial-step.tsx`, `code-block.tsx`)
- `components/next-logo.tsx`, `components/supabase-logo.tsx`
- `components/env-var-warning.tsx`, `components/deploy-button.tsx` (not observed wired into any page)
- `README.md` — still the generic "Next.js and Supabase Starter Kit" readme; contains none of the AUJ Store's actual purpose, setup, or module documentation.
- `app/protected/main/dashboard/data.ts` — an empty file.

None of this breaks anything, but it adds noise for a new contributor trying to understand "what is actually part of this product," and should be pruned as part of the documentation pass.

### 7.2 Duplicated "product status" logic
The in-stock/low-stock/out-of-stock classification (`quantity` vs `stock_threshhold`) is implemented independently in at least three places:
- `lib/data.ts` (`fetchProducts`)
- `app/protected/main/inventory/page.tsx` (aggregate counts)
- `app/protected/main/orders/_components/order-page-interface.tsx` (`setStatusColor`)

Any future change to the stock-status thresholds/rules requires updating all three in lockstep, which is a natural place for future bugs. Should be a single shared utility (`lib/status.ts` or similar).

### 7.3 Duplicated debounce pattern (see 5.5) — one correct implementation exists but isn't reused.

### 7.4 Four near-duplicate chart components
`net-profit-chart.tsx`, `accumulated-profit-chart.tsx`, `daily-sales-chart.tsx`, `accumulated-sales-chart.tsx` are ~150 lines each and differ only in: which field they sum (`total_profit` vs `total`), chart type (`Line` vs `Area`), and title text. This is a strong candidate for a single parameterized component (metric type × view mode), which would also fix the current situation where a bug fix (e.g., the loading state, or the dropdown) has to be manually applied in four places.

### 7.5 Validation/coercion mismatch in Inventory forms
**File:** `app/protected/main/inventory/_components/forms.tsx`

```ts
const ProductSchema = z.object({
  name: z.string(),
  category: z.string(),
  quantity: z.coerce.number(),
  stock_threshhold: z.number(),   // ← not coerced
  cost: z.coerce.number(),
  price: z.coerce.number(),
});
```
`stock_threshhold` is parsed manually with `parseInt(...)` *before* being handed to `safeParse`, while the schema itself still declares a plain (non-coerced) `z.number()`. It happens to work because the manual `parseInt` runs first, but it's inconsistent with the rest of the schema and fragile if the manual parsing is ever removed. All numeric fields should uniformly use `z.coerce.number()` and receive raw `FormData` strings.

### 7.6 Logging hygiene
Numerous `console.log`/`console.error` calls are left in shipped code paths (`lib/data.ts`, `app/protected/main/orders/actions.ts`, `app/protected/main/orders/_components/order-page-interface.tsx`, etc.), some of which log full order/order-item payloads. Fine for a personal/learning project; should be removed or routed through a real logger before a live user relies on this in production, both for noise and for not leaking data into browser/server logs unnecessarily.

### 7.7 Naming/typo debt
`stock_threshhold` (see 4.2/M3) and the utility name `twoDecimal()` (which actually returns a full localized PHP-currency string via `Intl.NumberFormat`, not merely "two decimal places") are both minor but worth fixing/renaming as part of a documentation-driven cleanup, since they'll otherwise get baked into whatever SRS/function list is written next.

### 7.8 No automated tests, no CI
There is no test runner (`jest`/`vitest`/`playwright`) configured, no `__tests__` directories, and no CI workflow (e.g., `.github/workflows`). Given the order/stock bug in 5.1 was invisible in normal manual use, this is a concrete example of the kind of defect that a basic integration test around `submitNewOrder` would have caught.

### 7.9 Duplicate login entry points
`app/page.tsx` (root `/`) renders `LoginForm` directly, and `app/auth/login/page.tsx` renders the exact same component at `/auth/login`. Two functionally identical, independently maintained pages for the same purpose.

---

## 8. UX / Product Observations

- **No empty states**: brand-new store data (zero products, zero sales) produces `NaN%` bars (5.6) and empty scroll areas with no "nothing here yet" messaging anywhere (Low Stock, Out of Stock, Top Products, Sales History).
- **No pagination**: `fetchProducts()` and history/order queries load full result sets. Fine at current scale; will need addressing as the product catalog and sales history grow.
- **Accessibility**: several icon-only action buttons (Add Stock `+`, Edit pencil, Delete trash icon in `raw-actions.tsx`) have no `aria-label`, relying purely on the icon for meaning.
- **Toast reliability**: as noted in 5.10, success toasts fire regardless of whether the underlying write actually succeeded — this will erode user trust in the system's error messaging the first time a save silently fails.
- **Print Job / Analytics**: both are visible, clickable sidebar entries that lead to placeholder text. This is fine as a known, intentional gap (per project notes) but should be clearly called out in user-facing release notes/scope so the store owner doesn't think it's broken.

---

## 9. What's Working Well (for balance)

- Clear separation of Supabase client construction by context (`lib/supabase/client.ts` for browser, `server.ts` for RSC/server actions, `proxy.ts` for middleware) — this part follows current Supabase/Next.js SSR guidance correctly.
- Consistent route-scoped folder structure (`_components` per route) makes it easy to find UI for a given page.
- `sonner` toast usage is applied consistently across every CRUD action for user feedback (even though the *content* of the feedback isn't always accurate — see 5.10).
- The one correctly-implemented debounced input (`DebouncedInput` in `products-table.tsx`) is a good, reusable pattern that just needs to be applied elsewhere.
- RLS is at least turned on for every table (a meaningful baseline compared to no RLS at all), even though it needs to be made role-aware (6.1).
- Defensive handling of orphaned relations in `fetchOrderItems` (falls back to "Unknown Product"/"Uncategorized" instead of crashing when a `product_id` no longer resolves) shows good instinct even if the underlying deletion behavior that causes it isn't yet addressed.

---

## 10. Recommended Next Steps

### 10.1 Immediate (pre-launch / data-integrity blockers)
1. Fix `UpdateProductAfterSale` to update **every** order line item, not just the first (5.1).
2. Move stock decrement to an atomic SQL update (`quantity = quantity - :amount`) with a server-side guard against negative stock (5.3).
3. Correct `revalidatePath` targets to match real routes, or remove them in favor of the existing client-side refresh patterns (5.2).
4. Fix `.match()` → `.includes()` in both search inputs (5.4).
5. Make server actions return a real success/failure result and have callers surface actual errors instead of always showing a success toast (5.10).

### 10.2 Before adding more staff/users
6. Design and implement actual role-based access (admin vs. staff/cashier) at the RLS + UI level, and decide what, if anything, non-admins should not be able to do (6.1).
7. Add minimal audit columns (`created_by`, `updated_by`) to `products`, `orders`, `order_items` if accountability matters for this business.

### 10.3 Documentation to produce next (this audit is an input to these)
- **SRS** — user roles (once defined per 10.2), functional requirements per module, explicit statement that Print Job/Analytics are out of scope for the current phase.
- **Function/Action list** — one row per server action / data-fetch function (name, file, inputs, side effects, known caveats — several of which are already itemized in Section 5 above).
- **Data dictionary** — reconcile `auj_db_schema.md` against `lib/models.ts` and fix the mismatches in 4.2 in one direction or the other, then keep that document as the schema source of truth going forward since there are no code-first migrations.
- **Known-issues/backlog** — this audit's Section 5 can be copied directly into a tracked issue list.

### 10.4 Cleanup (low risk, improves maintainability)
- Remove unused starter-template files (7.1) and rewrite `README.md` to describe AUJ Store specifically.
- Consolidate the four chart components into one parameterized component (7.4).
- Centralize the in-stock/low-stock/out-of-stock classification into a single shared helper (7.2).
- Fix `stock_threshhold` naming if a schema migration is ever undertaken (low priority, but tag it now so it isn't forgotten).

---

## 11. Quick Reference — Issues by File

| File | Issues |
|---|---|
| `app/protected/main/orders/actions.ts` | 5.1 (critical), 5.2, 5.3, 5.10 |
| `app/protected/main/orders/_components/order-page-interface.tsx` | 5.3, 5.4, 5.5 |
| `app/protected/main/inventory/actions.ts` | 5.2, 5.9, 5.10 |
| `app/protected/main/inventory/_components/forms.tsx` | 7.5 |
| `app/protected/main/inventory/_components/raw-actions.tsx` | 5.7 |
| `app/protected/main/inventory/page.tsx` | 5.6, 7.2 |
| `app/protected/main/history/page.tsx` | 5.4, 5.5, 5.8 |
| `lib/data.ts` | M1 (print_jobs vs print_job), 7.2, 7.6 |
| `lib/models.ts` | M2, M3, M4, M5 |
| `lib/supabase/proxy.ts` | 6.5 |
| `lib/supabase/client.ts` / `server.ts` | 6.4 |
| `components/sign-up-form.tsx` | 6.3 |
| `app/page.tsx` / `app/auth/login/page.tsx` | 7.9 |
| `components/tutorial/*`, `next-logo.tsx`, `supabase-logo.tsx`, `env-var-warning.tsx`, `deploy-button.tsx`, `README.md`, `app/protected/main/dashboard/data.ts` | 7.1 (dead/leftover scaffolding) |
| `app/protected/main/dashboard/_components/*-chart.tsx` (4 files) | 7.4 |

---

*End of audit. This document reflects a static read of the provided source files only; it does not reflect runtime testing against a live Supabase instance, so items marked as "should be verified against the live project" (M1, M6) should be confirmed before being treated as confirmed bugs.*
