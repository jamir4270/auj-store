import { Database } from "@/lib/database.types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type OrderStatus = "complete" | "incomplete";
export type ProductStatus = "in_stock" | "low_stock" | "out_of_stock";

export type PrintServiceType = "photocopy" | "print";
export type PrintPaperType = "copier" | "photo";
export type PrintPaperSizeType =
  | "short"
  | "a4"
  | "long"
  | "2r"
  | "3r"
  | "4r"
  | "5r";
export type PrintColorMode = "b&w" | "color";

export type Product = Tables<"products"> & {
  status?: ProductStatus;
};

export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type PrintJob = Tables<"print_job">;
export type ServiceRate = Tables<"service_rates">;

export interface HistoryOrderItem extends OrderItem {
  name: string;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  profit: number;
}

export interface ProductAtSale extends Product {
  amount?: number;
  unit_price_at_sale?: number | null;
  subtotal?: number | null;
  profit?: number | null;
}
