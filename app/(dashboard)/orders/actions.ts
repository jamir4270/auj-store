"use server";

import { Order, OrderItem } from "@/lib/models";
import { ProductAtSale } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitNewOrder(
  order: Order,
  orderItems: ProductAtSale[]
) {
  try {
    const supabase = await createClient();

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert(order)
      .select()
      .single();

    if (orderError) {
      console.log("Failed to make order: ", orderError);
      throw orderError as Error;
    }

    console.log(orderData);

    const finalItems: OrderItem[] = orderItems.map((item) => {
      return {
        order_id: orderData.id,
        product_id: item.id as string,
        quantity: item.amount ?? 1,
        unit_price_at_sale: item.unit_price_at_sale ?? item.price,
        subtotal: item.subtotal ?? item.price,
        profit: item.profit ?? item.price - item.cost,
      };
    });

    const { data: orderItemData, error: itemError } = await supabase
      .from("order_items")
      .insert(finalItems)
      .select();

    if (itemError) {
      console.log("Failed to make order items: ", itemError);
      throw itemError as Error;
    }

    console.log(orderItemData);
    const status = UpdateProductAfterSale(orderItems);

    console.log("Update item status: ", status);

    revalidatePath("/protected/orders");
    return status;
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        "Failed inserting new order and order items to database: ",
        error.message
      );
    }
    return error;
  }
}

async function UpdateProductAfterSale(products: ProductAtSale[]) {
  try {
    const supabase = await createClient();
    for (const product of products) {
      const { status, error } = await supabase
        .from("products")
        .update({ quantity: product.quantity - (product.amount ?? 1) })
        .match({ id: product.id });
      if (error) {
        throw error as Error;
      }

      revalidatePath("/protected/orders");
      return status;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log("failed to update product after sale: ", error.message);
    }
    return error;
  }
}
