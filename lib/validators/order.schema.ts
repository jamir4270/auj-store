import { z } from "zod";

export const OrderItemInputSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unit_price_at_sale: z.coerce.number().min(0, "Unit price cannot be negative"),
  subtotal: z.coerce.number().min(0, "Subtotal cannot be negative"),
  profit: z.coerce.number().optional().default(0),
});

export const OrderInputSchema = z.object({
  total: z.coerce.number().min(0, "Total cannot be negative"),
  status: z.enum(["complete", "incomplete"]).default("complete"),
  partial_payment: z.coerce.number().nullable().optional(),
  total_profit: z.coerce.number().optional().default(0),
});

export const SubmitOrderPayloadSchema = z.object({
  order: OrderInputSchema,
  items: z.array(OrderItemInputSchema).min(1, "Order must have at least one line item"),
});

export type OrderItemInput = z.infer<typeof OrderItemInputSchema>;
export type OrderInput = z.infer<typeof OrderInputSchema>;
export type SubmitOrderPayload = z.infer<typeof SubmitOrderPayloadSchema>;
