"use server";

import { Product } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addStock(product: Product, amount: number) {
  try {
    const supabase = await createClient();

    const newQuantity = product.quantity + amount;
    const currentDate = new Date();

    const { status, error } = await supabase
      .from("products")
      .update({ quantity: newQuantity, updated_at: currentDate.toISOString() })
      .match({ id: product.id });

    if (error) {
      throw error;
    }

    revalidatePath("/protected/inventory");
    return status;
  } catch (error) {
    if (error) {
      console.error("Failed to update products table: ", error);
    }
  }
}
