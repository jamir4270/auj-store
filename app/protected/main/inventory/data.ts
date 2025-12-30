"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchProductsColumn(column: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("unique_categories")
      .select("unique_categories");

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    if (error) {
      console.log(`Failed to fetch ${column}: `, error);
    }
  }
}
