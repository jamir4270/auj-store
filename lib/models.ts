export type OrderStatus = "complete" | "incomplete";
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
export type ProductStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  id?: string;
  name: string;
  quantity: number;
  status?: ProductStatus;
  stock_threshhold: number;
  cost: number;
  price: number;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id?: string;
  total: number;
  status: OrderStatus;
  partial_payment: number;
  created_at?: string;
  updated_at?: string;
  total_profit: number;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_at_sale: number;
  subtotal: number;
  created_at?: string;
  profit: number;
}

export interface PrintJob {
  id: string | null;
  order_id: string | null;
  service_type: PrintServiceType;
  paper_type: PrintPaperType;
  paper_size: PrintPaperSizeType;
  color_mode: PrintColorMode;
  page_count: number;
  copies: number;
  subtotal: number;
  created_at: string | null;
}

export interface ProductAtSale extends Product {
  order_id?: string;
  amount?: number;
  unit_price_at_sale?: number;
  subtotal?: number;
  profit?: number;
}
