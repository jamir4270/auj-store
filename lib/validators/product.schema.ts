import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  barcode: z
    .string()
    .trim()
    .nullish()
    .transform((val) => (val && val.length > 0 ? val : null)),
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative"),
  stock_threshold: z.coerce
    .number()
    .int("Stock threshold must be an integer")
    .min(0, "Stock threshold cannot be negative"),
  cost: z.coerce
    .number()
    .min(0, "Cost cannot be negative"),
  price: z.coerce
    .number()
    .min(0, "Price cannot be negative"),
});

export const AddStockSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
  amount: z.coerce
    .number()
    .int("Amount must be an integer")
    .min(1, "Amount must be at least 1"),
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type AddStockInput = z.infer<typeof AddStockSchema>;
