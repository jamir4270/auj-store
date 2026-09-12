-- ==============================================================================
-- Migration: 20260912030000_atomic_order_processing.sql
-- Description: Adds atomic order processing RPC (process_order_sale) to handle
--              order insertion, order_items insertion, and inventory stock
--              decrements in a single ACID transaction with row-level locking.
-- ==============================================================================

CREATE OR REPLACE FUNCTION "public"."process_order_sale"(
  p_order jsonb,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity_sold bigint;
  v_current_stock bigint;
  v_product_name text;
  v_created_order jsonb;
BEGIN
  -- 1. Validate items array
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cannot process order with no order items.';
  END IF;

  -- 2. Verify and atomically decrement stock for each item with row lock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity_sold := (v_item->>'quantity')::bigint;

    IF v_quantity_sold <= 0 THEN
      RAISE EXCEPTION 'Item quantity must be greater than zero.';
    END IF;

    -- Lock the product row for update to prevent concurrent race conditions
    SELECT name, quantity INTO v_product_name, v_current_stock
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % not found.', v_product_id;
    END IF;

    IF v_current_stock < v_quantity_sold THEN
      RAISE EXCEPTION 'Insufficient stock for product "%": available %, requested %.',
        v_product_name, v_current_stock, v_quantity_sold;
    END IF;

    -- Decrement product stock
    UPDATE public.products
    SET
      quantity = quantity - v_quantity_sold,
      updated_at = now()
    WHERE id = v_product_id;
  END LOOP;

  -- 3. Insert the order
  INSERT INTO public.orders (
    total,
    status,
    partial_payment,
    total_profit,
    created_at,
    updated_at
  )
  VALUES (
    COALESCE((p_order->>'total')::numeric, 0),
    COALESCE(p_order->>'status', 'complete'),
    (p_order->>'partial_payment')::numeric,
    COALESCE((p_order->>'total_profit')::numeric, 0),
    now(),
    now()
  )
  RETURNING id INTO v_order_id;

  -- 4. Insert all order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      quantity,
      unit_price_at_sale,
      subtotal,
      profit,
      created_at
    )
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::bigint,
      COALESCE((v_item->>'unit_price_at_sale')::numeric, 0),
      COALESCE((v_item->>'subtotal')::numeric, 0),
      COALESCE((v_item->>'profit')::numeric, 0),
      now()
    );
  END LOOP;

  -- 5. Return the created order as json
  SELECT to_jsonb(o.*) INTO v_created_order
  FROM public.orders o
  WHERE o.id = v_order_id;

  RETURN v_created_order;
END;
$$;

-- Grant execute permissions to authenticated users and service_role
GRANT EXECUTE ON FUNCTION "public"."process_order_sale"(jsonb, jsonb) TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."process_order_sale"(jsonb, jsonb) TO "service_role";
