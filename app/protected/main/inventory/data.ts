"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchCategories() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("unique_categories")
      .select("unique_categories");

    if (error) {
      throw error;
    }

    return data as [];
  } catch (error) {
    if (error) {
      console.log(`Failed to fetch categories: `, error);
    }
  }
}
