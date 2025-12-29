import { Product, Order, OrderItem, PrintJob } from "./models";

import { createClient } from "./supabase/server";

export async function fetchProducts() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      throw error;
    }

    return data as Product[];
  } catch (error) {
    if (error instanceof Error) {
      console.log("Failed to fetch products: ", error.message);
    } else {
      console.log("Failed to fetch products: ", String(error));
    }
  }
}

export async function fetchOrders() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from("orders").select("*");

    if (error) {
      throw error;
    }

    return data as Order[];
  } catch (error) {
    if (error instanceof Error) {
      console.log("Failed to fetch orders: ", error.message);
    } else {
      console.log("Failed to fetch orders: ", String(error));
    }
  }
}

export async function fetchOrderItems(id: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id);

    if (error) {
      throw error;
    }

    return data as OrderItem[];
  } catch (error) {
    if (error instanceof Error) {
      console.log("Failed to fetch order items: ", error.message);
    } else {
      console.log("Failed to fetch order items: ", String(error));
    }
  }
}

export async function fetchPrintJobs(id: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("print_jobs")
      .select("*")
      .eq("order_id", id);

    if (error) {
      throw error;
    }

    return data as PrintJob[];
  } catch (error) {
    if (error instanceof Error) {
      console.log("Failed to fetch order items: ", error.message);
    } else {
      console.log("Failed to fetch order items: ", String(error));
    }
  }
}
