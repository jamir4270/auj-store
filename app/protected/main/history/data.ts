"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchOrderItems(startDate: string, endDate: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      throw error as Error;
    }

    console.log(data);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch order items: ", error.message);
    }
    console.log(error);
  }
}
