# Supabase Schema & Model Follow-Up Cleanup Items (Phase 8)

> **Context:** Per the code-first migration plan, these fixes are deliberately separated from the baseline migration snapshot. Each item below will be addressed in a future, dedicated migration paired with corresponding application code updates.

---

## 1. Resolved Baseline Audit Findings

* [x] **M1: `print_job` Table Naming Confirmation**
  * **Status:** Resolved in baseline.
  * **Detail:** Confirmed live database table name is `public.print_job` (singular). `lib/models.ts` and baseline migration both use singular `print_job`.

---

## 2. Pending Follow-Up Migration & Code Tasks

### Item 1: Typo in Column Name (`stock_threshhold` &rarr; `stock_threshold`)
* **Database Action:** Create a migration to rename column `products.stock_threshhold` to `products.stock_threshold`.
  ```sql
  ALTER TABLE public.products RENAME COLUMN stock_threshhold TO stock_threshold;
  ```
* **Application Code Touchpoints:**
  * `lib/models.ts`: Interface `Product.stock_threshold`
  * `lib/database.types.ts`: Regenerate types
  * `app/protected/main/inventory/_components/forms.tsx`: Zod validation schema & form field names
  * `app/protected/main/inventory/_components/product-columns.tsx`: Column accessor and header label
  * `app/protected/main/inventory/actions.ts`: Form parsing and update queries

### Item 2: Align `Order.partial_payment` Nullability
* **Issue:** In the PostgreSQL schema, `orders.partial_payment` is nullable (`double precision NULL`), but in TypeScript models or forms, check whether `partial_payment` is treated as required `0` or optional `null`.
* **Action:** Standardize on default `0.0` or explicit `number | null` across `lib/models.ts`, server actions, and UI checkout dialogs.

### Item 3: Type Consistency for `PrintJob.id` and `order_id`
* **Issue:** `PrintJob` model currently types `id: string | null` and `order_id: string | null`, whereas `OrderItem` types `order_id: string`.
* **Action:** Standardize UUID string typing across all entities in `lib/models.ts` and derive from `Database['public']['Tables']['...']['Row']` where possible.

### Item 4: RLS Policy Target Role Hardening for `print_job`
* **Issue:** The `print_job` DELETE policy is currently defined `TO PUBLIC` instead of `TO authenticated`.
* **Action:** Create migration to update policy:
  ```sql
  DROP POLICY "Enable delete for authenticated users" ON public.print_job;
  CREATE POLICY "Enable delete for authenticated users" ON public.print_job
    FOR DELETE TO authenticated USING (true);
  ```

### Item 5: Add RLS Policies for `service_rates`
* **Issue:** Table `service_rates` has RLS enabled but 0 policies defined, requiring server-side service role client or explicit SELECT policy for authenticated users.
* **Action:** Add read/write policies appropriate for staff and admin roles.
