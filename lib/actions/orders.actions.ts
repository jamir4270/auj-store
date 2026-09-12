"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SubmitOrderPayloadSchema } from "@/lib/validators/order.schema";
import { ActionResult } from "@/types/action.types";
import { Order, ProductAtSale } from "@/types/domain";

export async function submitNewOrder(
  order: Partial<Order>,
  orderItems: ProductAtSale[]
): Promise<ActionResult<Order>> {
  try {
    const rawItems = orderItems.map((item) => {
      const price = item.price ?? 0;
      const cost = item.cost ?? 0;
      const amount = item.amount ?? 1;

      return {
        product_id: item.id as string,
        quantity: amount,
        unit_price_at_sale: item.unit_price_at_sale ?? price,
        subtotal: item.subtotal ?? price * amount,
        profit: item.profit ?? (price - cost) * amount,
      };
    });

    const parsed = SubmitOrderPayloadSchema.safeParse({
      order: {
        total: order.total ?? 0,
        status: order.status ?? "complete",
        partial_payment: order.partial_payment ?? null,
        total_profit: order.total_profit ?? 0,
      },
      items: rawItems,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = fieldErrors[path] || [];
        fieldErrors[path].push(err.message);
      });

      return {
        success: false,
        error: "Validation failed: " + (parsed.error.issues[0]?.message || "Invalid order input"),
        fieldErrors,
      };
    }

    const supabase = await createClient();

    // 1. Try invoking the atomic RPC transaction
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "process_order_sale",
      {
        p_order: parsed.data.order,
        p_items: parsed.data.items,
      }
    );

    if (rpcError) {
      // If RPC is missing in local environment before migration run, fall back to safe sequential batch
      if (rpcError.message.includes("function") && rpcError.message.includes("process_order_sale")) {
        return await fallbackOrderProcessing(supabase, parsed.data.order, parsed.data.items);
      }

      return {
        success: false,
        error: rpcError.message || "Failed to process order transaction.",
      };
    }

    // Revalidate paths for dashboard, orders, inventory, and history
    revalidatePath("/orders");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/history");

    return {
      success: true,
      data: rpcData as unknown as Order,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error during checkout.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Fallback batch processing if database RPC is not yet registered in live instance
 */
async function fallbackOrderProcessing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderPayload: ReturnType<typeof SubmitOrderPayloadSchema.parse>["order"],
  itemsPayload: ReturnType<typeof SubmitOrderPayloadSchema.parse>["items"]
): Promise<ActionResult<Order>> {
  // Check all products stock before writing
  for (const item of itemsPayload) {
    const { data: prod, error: fetchErr } = await supabase
      .from("products")
      .select("id, name, quantity")
      .eq("id", item.product_id)
      .single();

    if (fetchErr || !prod) {
      return { success: false, error: `Product not found: ${item.product_id}` };
    }

    if (prod.quantity < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for product "${prod.name}". Available: ${prod.quantity}, Requested: ${item.quantity}`,
      };
    }
  }

  // Insert order
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select()
    .single();

  if (orderError || !orderData) {
    return { success: false, error: orderError?.message || "Failed to create order." };
  }

  // Insert order items
  const finalItems = itemsPayload.map((item) => ({
    order_id: orderData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price_at_sale: item.unit_price_at_sale,
    subtotal: item.subtotal,
    profit: item.profit,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(finalItems);
  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  // Decrement each product's stock (Fixed loop without early return - Audit 5.1)
  for (const item of itemsPayload) {
    const { data: prod } = await supabase
      .from("products")
      .select("quantity")
      .eq("id", item.product_id)
      .single();

    if (prod) {
      await supabase
        .from("products")
        .update({
          quantity: Math.max(0, (prod.quantity || 0) - item.quantity),
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.product_id);
    }
  }

  revalidatePath("/orders");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return {
    success: true,
    data: orderData as unknown as Order,
  };
}
