-- ==============================================================================
-- Migration: 20260912040000_add_product_barcode.sql
-- Description: Adds nullable barcode column to products with a partial unique index
--              to ensure commercial barcodes are unique while allowing unlimited
--              non-barcoded items (e.g. repacked goods, loose items, eggs).
-- ==============================================================================

-- 1. Add nullable barcode column to products table
ALTER TABLE "public"."products"
  ADD COLUMN IF NOT EXISTS "barcode" text NULL;

-- 2. Create partial unique index (ignoring NULL and empty strings)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_products_barcode"
  ON "public"."products"("barcode")
  WHERE "barcode" IS NOT NULL AND "barcode" != '';
