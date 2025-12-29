export type ProductCategory =
  | "school_supplies"
  | "snacks"
  | "beverages"
  | "accessories"
  | "others";
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

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: ProductCategory;
  created_at: string;
}

export interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  partial_payment: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_at_sale: number;
  subtotal: number;
  created_at: string;
}

export interface PrintJob {
  id: string;
  order_id: string;
  service_type: PrintServiceType;
  paper_type: PrintPaperType;
  paper_size: PrintPaperSizeType;
  color_mode: PrintColorMode;
  page_count: number;
  copies: number;
  subtotal: number;
  created_at: string;
}
