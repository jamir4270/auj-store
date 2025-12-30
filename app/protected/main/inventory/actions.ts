"use server";

import { Product } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addStock(product: Product, amount: number) {
  try {
    const supabase = await createClient();

    const newQuantity = product.quantity + amount;

    const { error } = await supabase
      .from("products")
      .update({ quantity: newQuantity })
      .match({ id: product.id });

    throw error;
  } catch (error) {
    if (error) {
      console.error("Failed to update products table: ", error);
    }
  }

  revalidatePath("/protected/inventory");
}
