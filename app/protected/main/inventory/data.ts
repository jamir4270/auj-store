"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchCategories(): Promise<string[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("category")
      .not("category", "is", null);

    if (error) {
      throw error;
    }

    const categoryNames = data.map((item) => item.category);
    const uniqueCategories = [...new Set(categoryNames)];

    return uniqueCategories;
  } catch (error) {
    console.error(`Failed to fetch categories: `, error);
    return [];
  }
}
