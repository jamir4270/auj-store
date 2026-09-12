"use server";

import { Product, Order, OrderItem, PrintJob, HistoryOrderItem } from "@/types/domain";
import { getProductStatus } from "@/lib/utils/stock-status";
import { createClient } from "./supabase/server";

export async function fetchProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    const products: Product[] = (data || []).map((item) => ({
      ...item,
      status: getProductStatus(item.quantity, item.stock_threshold),
    }));

    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Order[];
  } catch (error) {
    console.error("Failed to fetch orders:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function fetchOrdersWithRange(startDate: string, endDate: string): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Order[];
  } catch (error) {
    console.error("Failed to fetch orders in range:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (error) {
      throw error;
    }

    return (data || []) as OrderItem[];
  } catch (error) {
    console.error("Failed to fetch order items:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function fetchOrderItemsWithDetails(startDate: string, endDate: string): Promise<HistoryOrderItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("*, products(name, category)")
      .gte("created_at", startDate)
      .lt("created_at", endDate)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_at_sale: item.unit_price_at_sale,
      subtotal: item.subtotal,
      profit: item.profit,
      created_at: item.created_at,
      name: item.products?.name || "Unknown Product",
      category: item.products?.category || "Uncategorized",
    }));
  } catch (error) {
    console.error("Failed to fetch detailed order items:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function fetchPrintJobs(orderId: string): Promise<PrintJob[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("print_job")
      .select("*")
      .eq("order_id", orderId);

    if (error) {
      throw error;
    }

    return (data || []) as PrintJob[];
  } catch (error) {
    console.error("Failed to fetch print jobs:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function fetchOutOfStockProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .lte("quantity", 0);

    if (error) {
      throw error;
    }

    return (data || []).map((item) => ({
      ...item,
      status: "out_of_stock",
    }));
  } catch (error) {
    console.error("Error fetching out of stock products:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function fetchLowStockProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      throw error;
    }

    const lowStock = (data || []).filter(
      (item) => item.quantity > 0 && item.quantity <= item.stock_threshold
    );

    return lowStock.map((item) => ({
      ...item,
      status: "low_stock",
    }));
  } catch (error) {
    console.error("Error fetching low stock products:", error instanceof Error ? error.message : error);
    return [];
  }
}
