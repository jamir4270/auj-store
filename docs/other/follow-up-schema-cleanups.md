# Supabase Schema & Model Follow-Up Cleanup Items (Phase 8)

> **Context:** Per the code-first migration plan, these fixes are deliberately separated from the baseline migration snapshot. Each item below will be addressed in a future, dedicated migration paired with corresponding application code updates.

---

## 1. Resolved Baseline Audit Findings

* [x] **M1: `print_job` Table Naming Confirmation**
  * **Status:** Resolved in baseline.
  * **Detail:** Confirmed live database table name is `public.print_job` (singular). `lib/models.ts` and baseline migration both use singular `print_job`.

---

## 2. Follow-Up Migration & Code Tasks (Resolved)

Migration File: `supabase/migrations/20260912020000_follow_up_schema_cleanups.sql`

* [x] **Item 1: Typo in Column Name (`stock_threshhold` &rarr; `stock_threshold`)**
  * **Status:** Resolved in migration `20260912020000_follow_up_schema_cleanups.sql` & application code.
  * **Database Action:**
    ```sql
    ALTER TABLE public.products RENAME COLUMN stock_threshhold TO stock_threshold;
    ```
  * **Application Code Touchpoints Updated:**
    * `lib/models.ts`: Interface `Product.stock_threshold`
    * `lib/database.types.ts`: Updated `products` table Row, Insert, and Update definitions
    * `lib/data.ts`: Updated `fetchProducts` and `fetchLowStockProducts` references
    * `app/protected/main/inventory/_components/forms.tsx`: Zod validation schema & form field names
    * `app/protected/main/inventory/actions.ts`: Form parsing and update queries

* [x] **Item 2: Align `Order.partial_payment` Nullability**
  * **Status:** Resolved in `lib/models.ts` and checkout actions.
  * **Detail:** Standardized `partial_payment: number | null` on `Order` interface matching database schema nullability while defaulting to `0` in POS order forms.

* [x] **Item 3: Type Consistency for `PrintJob.id` and `order_id`**
  * **Status:** Resolved in `lib/models.ts` and `lib/data.ts`.
  * **Detail:** Standardized UUID string typing to `id?: string`, `order_id?: string`, `created_at?: string` on `PrintJob` and `OrderItem`. Corrected `fetchPrintJobs` table query from `print_jobs` to `print_job`.

* [x] **Item 4: RLS Policy Target Role Hardening for `print_job`**
  * **Status:** Resolved in migration `20260912020000_follow_up_schema_cleanups.sql`.
  * **Detail:** Dropped PUBLIC delete policy and applied `TO authenticated`.

* [x] **Item 5: Add RLS Policies for `service_rates`**
  * **Status:** Resolved in migration `20260912020000_follow_up_schema_cleanups.sql`.
  * **Detail:** Added SELECT, INSERT, UPDATE, and DELETE policies for authenticated role.
