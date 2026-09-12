# Schema Comparison & Baseline Diff

**Generated Date:** 2026-09-12  
**Source Migration:** `supabase/migrations/20260912001600_remote_schema.sql`  
**Reference Document:** `auj_db_schema.md`

---

## 1. Audit Finding M1 Resolution

| Audit Item | Question / Discrepancy | Live Schema Reality | Resolution & Impact |
|:---|:---|:---|:---|
| **M1: Print Job Table Name** | Is the table named `print_job` or `print_jobs`? | **`public.print_job`** (Singular) | Confirmed definitively as `print_job`. All backend queries, RLS policies, foreign keys (`print_job_order_id_fkey`), and TypeScript interfaces (`PrintJob`) must use singular `print_job`. |

---

## 2. Executive Summary of Differences

| Category | In `auj_db_schema.md` | In Pulled Migration (`remote_schema.sql`) | Notes |
|:---|:---|:---|:---|
| **Table Names** | `orders`, `order_items`, `products`, `print_job`, `service_rates` | `orders`, `order_items`, `products`, `print_job`, `service_rates` | Exact 1:1 match across all 5 tables |
| **Foreign Keys** | Not documented | 3 Foreign Keys defined with cascading rules | `order_items` &rarr; `orders`, `order_items` &rarr; `products`, `print_job` &rarr; `orders` |
| **Database Views** | Not documented | 1 View: `unique_categories` | `SELECT DISTINCT category FROM products` (`security_invoker=on`) |
| **Column Defaults** | Partial / implicit | Explicit `DEFAULT gen_random_uuid()`, `DEFAULT now()` | FK UUID columns also contain default UUID generators |
| **Sequences & PKs** | `service_rates.id` as `int8 Primary Unique Identity` | Sequence `public.print_rates_id_seq` with `print_rates_pkey` and `print_rates_id_key` | Legacy naming `print_rates` preserved in constraint & sequence identifiers |
| **RLS Policies** | 13 policies listed | 13 policies pulled | 1 subtle role discrepancy (`print_job` delete policy target role) |
| **Table Grants** | Not documented | Explicit table-level GRANTs for `anon`, `authenticated`, `postgres`, `service_role` | Covers all CRUD and DDL/maintenance triggers |

---

## 3. Comprehensive Entity-by-Entity Diff

### 3.1 Table: `orders`

```diff
  CREATE TABLE "public"."orders" (
-   id uuid [Primary]
+   "id" uuid NOT NULL DEFAULT gen_random_uuid(),
-   total float8
+   "total" double precision NOT NULL,
-   status text
+   "status" text NOT NULL,
-   partial_payment float8 [Nullable]
+   "partial_payment" double precision,
-   created_at timestamptz [Nullable]
+   "created_at" timestamp with time zone DEFAULT now(),
-   updated_at timestamptz [Nullable]
+   "updated_at" timestamp with time zone DEFAULT now(),
-   total_profit float8 [Nullable]
+   "total_profit" double precision,
+   CONSTRAINT "orders_pkey" PRIMARY KEY (id)
  );
```

* **Differences:**
  * `total` and `status` are explicitly `NOT NULL`.
  * `id` specifies `DEFAULT gen_random_uuid()`.
  * `created_at` and `updated_at` specify `DEFAULT now()`.
  * Primary key constraint name: `orders_pkey`.

---

### 3.2 Table: `order_items`

```diff
  CREATE TABLE "public"."order_items" (
-   id uuid [Primary]
+   "id" uuid NOT NULL DEFAULT gen_random_uuid(),
-   order_id uuid [Nullable]
+   "order_id" uuid DEFAULT gen_random_uuid(),
-   product_id uuid [Nullable]
+   "product_id" uuid DEFAULT gen_random_uuid(),
-   quantity int8
+   "quantity" bigint NOT NULL,
-   unit_price_at_sale float8 [Nullable]
+   "unit_price_at_sale" double precision,
-   subtotal float8 [Nullable]
+   "subtotal" double precision,
-   created_at timestamptz
+   "created_at" timestamp with time zone NOT NULL DEFAULT now(),
-   profit float8 [Nullable]
+   "profit" double precision,
+   CONSTRAINT "order_items_pkey" PRIMARY KEY (id)
  );
+ ALTER TABLE "public"."order_items"
+   ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;
+ ALTER TABLE "public"."order_items"
+   ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;
```

* **Differences:**
  * **Foreign Key 1:** `order_items_order_id_fkey` linked to `orders(id)` with cascade on update and delete.
  * **Foreign Key 2:** `order_items_product_id_fkey` linked to `products(id)` with cascade on update and restrict on delete.
  * `order_id` and `product_id` have `DEFAULT gen_random_uuid()` assigned at column level.
  * `created_at` is `NOT NULL DEFAULT now()`.

---

### 3.3 Table: `products`

```diff
  CREATE TABLE "public"."products" (
-   id uuid [Primary]
+   "id" uuid NOT NULL DEFAULT gen_random_uuid(),
-   name text [Nullable]
+   "name" text,
-   quantity int8
+   "quantity" bigint NOT NULL,
-   price float8 [Nullable]
+   "price" double precision,
-   created_at timestamptz
+   "created_at" timestamp with time zone NOT NULL DEFAULT now(),
-   category text [Nullable]
+   "category" text,
-   stock_threshhold int8
+   "stock_threshhold" bigint NOT NULL,
-   cost float8 [Nullable]
+   "cost" double precision,
-   updated_at timestamptz [Nullable]
+   "updated_at" timestamp with time zone DEFAULT now(),
+   CONSTRAINT "products_pkey" PRIMARY KEY (id)
  );
```

* **Differences:**
  * `created_at` is `NOT NULL DEFAULT now()`.
  * `updated_at` has `DEFAULT now()`.
  * Column `stock_threshhold` preserves the specific spelling (`stock_threshhold`) with double 'h'.

---

### 3.4 Table: `print_job`

```diff
  CREATE TABLE "public"."print_job" (
-   id uuid [Primary]
+   "id" uuid NOT NULL DEFAULT gen_random_uuid(),
-   order_id uuid [Nullable]
+   "order_id" uuid DEFAULT gen_random_uuid(),
-   service_type text [Nullable]
+   "service_type" text,
-   paper_type text [Nullable]
+   "paper_type" text,
-   paper_size text [Nullable]
+   "paper_size" text,
-   color_mode text [Nullable]
+   "color_mode" text,
-   page_count int8 [Nullable]
+   "page_count" bigint,
-   copies int8 [Nullable]
+   "copies" bigint,
-   subtotal float8 [Nullable]
+   "subtotal" double precision,
-   created_at timestamptz
+   "created_at" timestamp with time zone NOT NULL DEFAULT now(),
+   CONSTRAINT "print_job_pkey" PRIMARY KEY (id)
  );
+ ALTER TABLE "public"."print_job"
+   ADD CONSTRAINT "print_job_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;
```

* **Differences:**
  * **Table Name:** Confirmed as singular `print_job`.
  * **Foreign Key:** `print_job_order_id_fkey` linked to `orders(id)` with cascade on update and delete.
  * `order_id` has `DEFAULT gen_random_uuid()`.
  * `created_at` is `NOT NULL DEFAULT now()`.

---

### 3.5 Table: `service_rates`

```diff
  CREATE TABLE "public"."service_rates" (
-   id int8 [Primary Unique Identity]
+   "id" bigint GENERATED BY DEFAULT AS IDENTITY (SEQUENCE NAME "public"."print_rates_id_seq") NOT NULL,
-   service_type text [Nullable]
+   "service_type" text,
-   paper_type text [Nullable]
+   "paper_type" text,
-   paper_size text [Nullable]
+   "paper_size" text,
-   color_mode text [Nullable]
+   "color_mode" text,
-   price float8 [Nullable]
+   "price" double precision,
-   created_at timestamptz [Nullable]
+   "created_at" timestamp with time zone DEFAULT now(),
-   updated_at timestamptz [Nullable]
+   "updated_at" timestamp with time zone DEFAULT now(),
-   profit float8 [Nullable]
+   "profit" double precision,
+   CONSTRAINT "print_rates_id_key" UNIQUE (id),
+   CONSTRAINT "print_rates_pkey" PRIMARY KEY (id)
  );
```

* **Differences:**
  * Underlying sequence name is `public.print_rates_id_seq`.
  * Constraints are named `print_rates_pkey` and `print_rates_id_key`.

---

## 4. Database Views (Present in DB, Missing in Doc)

```sql
CREATE VIEW "public"."unique_categories" WITH (security_invoker=on) AS
  SELECT DISTINCT category
  FROM public.products;
```

* **Purpose:** Used by UI dropdowns and filter selectors across Inventory and POS to retrieve current product categories dynamically.
* **Security Model:** Uses `security_invoker=on`, enforcing the calling user's RLS permissions.

---

## 5. Row Level Security & Policy Matrix

| Table | Policy Name | Command | Target Role (Markdown) | Target Role (Live DB) | USING | WITH CHECK | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `order_items` | `Enable delete for all authenticated users` | DELETE | `authenticated` | `authenticated` | `true` | — | Exact Match |
| `order_items` | `Enable insert for authenticated users only` | INSERT | `authenticated` | `authenticated` | — | `true` | Exact Match |
| `order_items` | `Enable read access to all authenticated users` | SELECT | `authenticated` | `authenticated` | `true` | — | Exact Match |
| `orders` | `Enable delete for authenticated users` | DELETE | `authenticated` | `authenticated` | `true` | — | Exact Match |
| `orders` | `Enable insert for authenticated users only` | INSERT | `authenticated` | `authenticated` | — | `true` | Exact Match |
| `orders` | `Enable read access for all authenticated users` | SELECT | `authenticated` | `authenticated` | `true` | — | Exact Match |
| `print_job` | `Enable delete for authenticated users` | DELETE | `public` | `PUBLIC` | `true` | — | **Discrepancy in role naming (Applies to PUBLIC)** |
| `print_job` | `Enable insert for authenticated users only` | INSERT | `authenticated` | `authenticated` | — | `true` | Exact Match |
| `print_job` | `Enable read access for all authenticated users` | SELECT | `authenticated` | `authenticated` | `true` | — | Exact Match |
| `products` | `Allow authenticated user to update table` | UPDATE | `authenticated` | `authenticated` | `true` | — | Exact Match |
| `products` | `Enable delete for authenticated` | DELETE | `authenticated` | `authenticated` | `true` | — | Exact Match |
| `products` | `Enable insert for admin users only` | INSERT | `authenticated` | `authenticated` | — | `true` | Exact Match |
| `products` | `Enable read access for all authenticated users` | SELECT | `authenticated` | `authenticated` | `true` | — | Exact Match |
| `service_rates` | *(No policies)* | — | *(None)* | *(None)* | — | — | RLS Enabled, No policies defined |

---

## 6. Recommendations & Action Items

1. **Foreign Key Awareness in Application Logic:** When deleting an order, `order_items` and `print_job` will automatically cascade-delete. Deleting a product referenced in `order_items` will be blocked by `RESTRICT`.
2. **Review `print_job` DELETE Policy:** The DELETE policy targets `PUBLIC` instead of `authenticated`, which permits unauthenticated delete if anon key has table grant. Consider tightening to `authenticated`.
3. **Add RLS Policies for `service_rates`:** Currently `service_rates` has RLS enabled with 0 policies, blocking all direct client reads unless accessed via service role or policies added.
