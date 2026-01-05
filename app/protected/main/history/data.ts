"use server";

import { HistoryOrderItem } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";

export async function fetchOrderItems(
  startDate: string,
  endDate: string
): Promise<HistoryOrderItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("order_items")
      .select(`*, products (name, category)`)
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      throw error as Error;
    }
    if (!data) return [];

    // SAFE MAPPING
    const cleanData: HistoryOrderItem[] = data.map((item) => {
      // 1. Safety check for the relationship
      if (!item.products) {
        console.warn(`⚠️ Order Item ${item.id} has no linked Product!`);
        return {
          ...item,
          name: "Unknown Product",
          category: "Uncategorized",
        };
      }

      return {
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        name: item.products.name,
        category: item.products.category,
        quantity: item.quantity,
        unit_price_at_sale: item.unit_price_at_sale,
        subtotal: item.subtotal,
        created_at: item.created_at,
        profit: item.profit,
      };
    });

    return cleanData;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch order items: ", error.message);
    }
    console.log(error);
    return [];
  }
}
