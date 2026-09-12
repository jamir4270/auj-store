import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddNewProduct } from "@/components/inventory/add-product";
import { fetchProducts, fetchCategories } from "@/lib/data";
import { Product } from "@/types/domain";
import { formatPHP } from "@/lib/utils/currency";
import { ProductsTableWrapper } from "@/components/inventory/products-table-wrapper";
import { Warehouse, PackageCheck, AlertTriangle, XCircle } from "lucide-react";

export default async function Inventory() {
  const products: Product[] = (await fetchProducts()) ?? [];
  const categories = await fetchCategories();

  let total_asset_value = 0;
  let in_stock_count = 0;
  let low_stock_count = 0;
  let out_of_stock_count = 0;

  for (const product of products) {
    total_asset_value += (product.price || 0) * (product.quantity || 0);
    if (product.status === "in_stock") in_stock_count++;
    else if (product.status === "low_stock") low_stock_count++;
    else if (product.status === "out_of_stock") out_of_stock_count++;
  }

  const totalCount = products.length;
  const in_stock_percentage = totalCount > 0 ? (in_stock_count / totalCount) * 100 : 0;
  const low_stock_percentage = totalCount > 0 ? (low_stock_count / totalCount) * 100 : 0;
  const out_of_stock_percentage = totalCount > 0 ? (out_of_stock_count / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Warehouse className="h-6 w-6" />
            Inventory Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage catalog, adjust stock levels, and monitor inventory valuation.
          </p>
        </div>
        <AddNewProduct categories={categories} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Inventory Valuation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-bold tracking-tight">{formatPHP(total_asset_value)}</div>
            <p className="text-xs text-muted-foreground mt-1">Retail value across all items</p>
          </CardContent>
        </Card>

        <Card className="p-4 md:col-span-2 flex flex-col justify-between gap-3">
          <CardHeader className="p-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Stock Status Breakdown ({totalCount} items)
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {totalCount === 0 ? (
              <div className="h-4 bg-muted rounded-full w-full" />
            ) : (
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted gap-0.5">
                {in_stock_percentage > 0 && (
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${in_stock_percentage}%` }}
                    title={`In Stock: ${in_stock_count}`}
                  />
                )}
                {low_stock_percentage > 0 && (
                  <div
                    className="bg-amber-500 h-full transition-all"
                    style={{ width: `${low_stock_percentage}%` }}
                    title={`Low Stock: ${low_stock_count}`}
                  />
                )}
                {out_of_stock_percentage > 0 && (
                  <div
                    className="bg-rose-500 h-full transition-all"
                    style={{ width: `${out_of_stock_percentage}%` }}
                    title={`Out of Stock: ${out_of_stock_count}`}
                  />
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="p-0 flex flex-wrap gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <PackageCheck className="h-4 w-4" />
              <span>In stock: {in_stock_count}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Low stock: {low_stock_count}</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
              <XCircle className="h-4 w-4" />
              <span>Out of stock: {out_of_stock_count}</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card className="flex-1 min-h-0">
        <CardContent className="p-4">
          <ProductsTableWrapper
            products={products}
            categories={categories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
