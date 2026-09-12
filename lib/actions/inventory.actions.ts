"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProductSchema, AddStockSchema } from "@/lib/validators/product.schema";
import { ActionResult } from "@/types/action.types";
import { Product } from "@/types/domain";

export async function addProduct(input: unknown): Promise<ActionResult<Product>> {
  try {
    const parsed = ProductSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid product details.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        barcode: parsed.data.barcode,
        name: parsed.data.name,
        category: parsed.data.category,
        quantity: parsed.data.quantity,
        stock_threshold: parsed.data.stock_threshold,
        cost: parsed.data.cost,
        price: parsed.data.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A product with this barcode already exists." };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/inventory");
    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return { success: true, data: data as Product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product.",
    };
  }
}

export async function editProduct(input: unknown): Promise<ActionResult<Product>> {
  try {
    const parsed = ProductSchema.safeParse(input);
    if (!parsed.success || !parsed.data.id) {
      return {
        success: false,
        error: parsed.error?.issues[0]?.message || "Invalid product ID or details.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update({
        barcode: parsed.data.barcode,
        name: parsed.data.name,
        category: parsed.data.category,
        quantity: parsed.data.quantity,
        stock_threshold: parsed.data.stock_threshold,
        cost: parsed.data.cost,
        price: parsed.data.price,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A product with this barcode already exists." };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/inventory");
    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return { success: true, data: data as Product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to edit product.",
    };
  }
}

export async function addStock(input: unknown): Promise<ActionResult<Product>> {
  try {
    const parsed = AddStockSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid stock amount.",
      };
    }

    const supabase = await createClient();

    // Fetch existing product
    const { data: existing, error: fetchErr } = await supabase
      .from("products")
      .select("id, quantity")
      .eq("id", parsed.data.id)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: "Product not found." };
    }

    const newQuantity = (existing.quantity || 0) + parsed.data.amount;

    const { data, error } = await supabase
      .from("products")
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/inventory");
    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return { success: true, data: data as Product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to adjust stock.",
    };
  }
}

export async function getProductByBarcode(barcode: string): Promise<ActionResult<Product | null>> {
  try {
    const trimmed = barcode?.trim();
    if (!trimmed) {
      return { success: true, data: null };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", trimmed)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as Product) || null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to look up barcode.",
    };
  }
}

export async function quickCreateAndSellProduct(input: unknown): Promise<ActionResult<Product>> {
  try {
    const parsed = ProductSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid product details.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        barcode: parsed.data.barcode,
        name: parsed.data.name,
        category: parsed.data.category,
        quantity: parsed.data.quantity,
        stock_threshold: parsed.data.stock_threshold,
        cost: parsed.data.cost,
        price: parsed.data.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A product with this barcode already exists." };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/inventory");
    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return { success: true, data: data as Product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product for sale.",
    };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult<void>> {
  try {
    if (!productId) {
      return { success: false, error: "Product ID is required." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      if (error.code === "23503") {
        return {
          success: false,
          error: "Cannot delete product because it is linked to past sales records.",
        };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/inventory");
    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete product.",
    };
  }
}
