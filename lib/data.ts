import {
  ProductCategory,
  OrderStatus,
  PrintServiceType,
  PrintPaperType,
  PrintPaperSizeType,
  PrintColorMode,
} from "./models";
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
      console.log("An error occured: ", error.message);
    } else {
      console.log("An error occured: ", String(error));
    }
  }
}
