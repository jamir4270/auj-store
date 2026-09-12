"use server";

import { Product, Order, OrderItem, PrintJob } from "./models";
import { createClient } from "./supabase/server";

export async function fetchProducts(): Promise<Product[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    const products: Product[] = data.map((item) => {
      return {
        ...item,
        status:
          item.quantity >= item.stock_threshold
            ? "in_stock"
            : item.quantity < item.stock_threshold && item.quantity != 0
            ? "low_stock"
            : "out_of_stock",
      };
    });

    return products;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Failed to fetch products: ", error.message);
      return [];
    } else {
      console.log("Failed to fetch products: ", String(error));
      return [];
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
      throw error;
    } else {
      console.log("Failed to fetch orders: ", String(error));
      throw error;
    }
  }
}

export async function fetchOrdersWithRange(startDate: string, endDate: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", startDate)
      .lt("created_at", endDate);

    if (error) {
      throw error;
    }

    return data as Order[];
  } catch (error) {
    if (error instanceof Error) {
      console.log("Failed to fetch orders: ", error.message);
      throw error;
    } else {
      console.log("Failed to fetch orders: ", String(error));
      throw error;
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
      throw error;
    } else {
      console.log("Failed to fetch order items: ", String(error));
      throw error;
    }
  }
}

export async function fetchPrintJobs(id: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("print_job")
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

export async function fetchOutOfStockProducts() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("quantity", 0);

    if (error) {
      console.log("Error fetching out of stock products: ", error);
      throw error as Error;
    }

    return data as Product[];
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching data: ", error.message);
    }
    return [];
  }
}

export async function fetchLowStockProducts() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.log("Error fetching low stock products: ", error);
      throw error as Error;
    }

    const lowStock = data.filter((item) => {
      return item.quantity < item.stock_threshold && item.quantity !== 0;
    });

    return lowStock as Product[];
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching data: ", error.message);
    }
    return [];
  }
}
