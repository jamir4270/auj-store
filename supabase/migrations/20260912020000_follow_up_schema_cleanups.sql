-- ==============================================================================
-- Migration: 20260912020000_follow_up_schema_cleanups.sql
-- Description: Phase 8 Follow-Up Schema Cleanups
-- 1. Rename column products.stock_threshhold -> stock_threshold
-- 2. Update print_job DELETE policy target role to authenticated
-- 3. Add RLS policies for service_rates
-- ==============================================================================

-- 1. Rename typo in products table column
ALTER TABLE "public"."products"
  RENAME COLUMN "stock_threshhold" TO "stock_threshold";

-- 2. Harden print_job DELETE policy target role from PUBLIC to authenticated
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "public"."print_job";

CREATE POLICY "Enable delete for authenticated users" ON "public"."print_job"
  FOR DELETE
  TO "authenticated"
  USING (true);

-- 3. Add RLS policies for service_rates
CREATE POLICY "Enable read access for all authenticated users" ON "public"."service_rates"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."service_rates"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."service_rates"
  FOR UPDATE
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON "public"."service_rates"
  FOR DELETE
  TO "authenticated"
  USING (true);
