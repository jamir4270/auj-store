import { ProductStatus } from "@/types/domain";

/**
 * Single source of truth for determining a product's stock status.
 */
export function getProductStatus(
  quantity: number | null | undefined,
  threshold: number | null | undefined
): ProductStatus {
  const qty = quantity ?? 0;
  const th = threshold ?? 0;

  if (qty <= 0) {
    return "out_of_stock";
  }

  if (qty <= th) {
    return "low_stock";
  }

  return "in_stock";
}

/**
 * Maps stock status to human-readable label and UI color badge styles.
 */
export function getStockStatusMetadata(status: ProductStatus) {
  switch (status) {
    case "in_stock":
      return {
        label: "In Stock",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
      };
    case "low_stock":
      return {
        label: "Low Stock",
        className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      };
    case "out_of_stock":
      return {
        label: "Out of Stock",
        className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
      };
  }
}
