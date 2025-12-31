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

export async function editProduct(product: Product) {
  try {
    const supabase = await createClient();

    const { status, error } = await supabase
      .from("products")
      .update({
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        stock_threshhold: product.stock_threshhold,
        cost: product.cost,
        price: product.price,
        updated_at: product.updated_at,
      })
      .match({ id: product.id });

    if (error) {
      throw error;
    }

    revalidatePath("/protected/inventory");
    return status;
  } catch (error) {
    if (error) {
      console.error("Failed to edit product in products table: ", error);
    }
  }
}

export async function deleteProduct(product: Product) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error(error);
    }
    revalidatePath("/protected/inventory");
  } catch (error) {
    if (error) {
      console.error("Failed to delete product: ", error);
    }
  }
}
