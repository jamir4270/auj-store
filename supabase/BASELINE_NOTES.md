# Supabase Baseline Notes

**Generated Date:** 2026-09-12  
**Pulled Migration File:** `supabase/migrations/20260912001600_remote_schema.sql`  
**Reference Document:** `auj_db_schema.md`

---

## 1. Audit Finding M1 Resolution: Table Naming

* **Finding:** Discrepancy / ambiguity regarding whether the print job table is named `print_job` or `print_jobs`.
* **Definitive Confirmation:** The actual table in the database is named **`print_job`** (singular), matching the definition in `auj_db_schema.md` and TypeScript model `PrintJob` in `lib/models.ts`.
* **Primary Key & Constraints:** 
  * Primary key constraint name: `print_job_pkey`
  * Foreign key constraint name: `print_job_order_id_fkey`

---

## 2. Schema Elements in Pulled Migration Not in `auj_db_schema.md`

The following elements exist in the live database schema (as captured by the CLI pull) but were omitted or unspecified in the initial `auj_db_schema.md`:

### A. Foreign Key Constraints
`auj_db_schema.md` did not document relational constraints between tables. The pulled schema confirms the following active foreign keys:
* **`order_items.order_id`** &rarr; `orders(id)` with `ON UPDATE CASCADE ON DELETE CASCADE`
* **`order_items.product_id`** &rarr; `products(id)` with `ON UPDATE CASCADE ON DELETE RESTRICT`
* **`print_job.order_id`** &rarr; `orders(id)` with `ON UPDATE CASCADE ON DELETE CASCADE`

### B. Database Views
* **`unique_categories`**: Defined as:
  ```sql
  CREATE VIEW "public"."unique_categories" WITH (security_invoker=on) AS
    SELECT DISTINCT category FROM public.products;
  ```

### C. Column Default Values & Sequences
* **UUID Column Defaults:** All UUID primary keys (`orders.id`, `order_items.id`, `products.id`, `print_job.id`) and foreign keys (`order_items.order_id`, `order_items.product_id`, `print_job.order_id`) have `DEFAULT gen_random_uuid()`.
* **Timestamp Defaults:** `created_at` and `updated_at` across tables have `DEFAULT now()`.
* **Identity Sequence:** Table `service_rates` uses identity sequence `public.print_rates_id_seq` with constraints `print_rates_pkey` and `print_rates_id_key`.

### D. Table Grants
Explicit `GRANT` statements are active across all 5 tables (`order_items`, `orders`, `print_job`, `products`, `service_rates`) and the view `unique_categories` for roles:
* `anon`, `authenticated`, `postgres`, `service_role` with operations: `DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE`.

### E. RLS Policy Target Roles
* On table `print_job`, the policy `"Enable delete for authenticated users"` is configured with `TO PUBLIC` rather than `TO authenticated` in the live database.
* `service_rates` has Row Level Security enabled (`ENABLE ROW LEVEL SECURITY`), but has no policies defined.
